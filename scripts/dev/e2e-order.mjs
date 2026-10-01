/** Walks a guest through add-to-cart → checkout → success and reports each step. */
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3001";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const problems = [];
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
page.on("response", (r) => {
  if (r.status() >= 500) problems.push(`${r.status()} ${r.url()}`);
});

const step = async (name, fn) => {
  try {
    const value = await fn();
    console.log(`✓ ${name}${value ? ` — ${value}` : ""}`);
    return value;
  } catch (err) {
    console.log(`✗ ${name} — ${err.message}`);
    throw err;
  }
};

try {
  await step("open product", async () => {
    await page.goto(`${BASE}/ru/product/ferro-abb-crunch`, { waitUntil: "networkidle2" });
    return await page.title();
  });

  await step("add to cart", async () => {
    const buttons = await page.$$("button");
    for (const b of buttons) {
      const text = await b.evaluate((el) => el.textContent?.trim() ?? "");
      if (text.includes("В корзину")) {
        await b.click();
        break;
      }
    }
    await page.waitForFunction(
      () => document.querySelector('a[href$="/cart"] span')?.textContent?.trim() === "1",
      { timeout: 15000 },
    );
    return "badge = 1";
  });

  await step("open cart", async () => {
    await page.goto(`${BASE}/ru/cart`, { waitUntil: "networkidle2" });
    const rows = await page.$$eval("ul li h3", (els) => els.length);
    if (rows < 1) throw new Error("cart is empty");
    return `${rows} line(s)`;
  });

  await step("open checkout", async () => {
    await page.goto(`${BASE}/ru/checkout`, { waitUntil: "networkidle2" });
    await page.waitForSelector('input[name="firstName"]', { timeout: 15000 });
    return page.url().replace(BASE, "");
  });

  const orderNumber = await step("place order", async () => {
    await page.type('input[name="firstName"]', "Анвар");
    await page.type('input[name="phone"]', "+998901234567");
    await page.type('input[name="city"]', "Ташкент");
    await page.type('input[name="addressLine"]', "ул. Тестовая 1");
    await Promise.all([
      page.waitForFunction(() => location.pathname.includes("/checkout/success"), { timeout: 25000 }),
      page.click('button[type="submit"]'),
    ]);
    const url = new URL(page.url());
    return url.searchParams.get("order");
  });

  await step("cart emptied", async () => {
    await page.goto(`${BASE}/ru/cart`, { waitUntil: "networkidle2" });
    const empty = await page.$$eval("h2", (els) => els.some((e) => e.textContent?.includes("Корзина пуста")));
    if (!empty) throw new Error("cart still has items");
    return "yes";
  });

  console.log(`\nORDER=${orderNumber}`);
} finally {
  if (problems.length) console.log("\nproblems:\n" + [...new Set(problems)].slice(0, 10).join("\n"));
  await browser.close();
}
