/** Verifies an admin edit reaches the database and the storefront. */
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3001";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

const problems = [];
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
page.on("response", (r) => r.status() >= 500 && problems.push(`${r.status()} ${r.url()}`));

let failures = 0;
const step = async (name, fn) => {
  try {
    const v = await fn();
    console.log(`✓ ${name}${v ? ` — ${v}` : ""}`);
    return v;
  } catch (e) {
    failures += 1;
    console.log(`✗ ${name} — ${e.message}`);
    throw e;
  }
};

const PRICE = 4_990_000;

try {
  await step("login", async () => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle2" });
    await page.type('input[name="email"]', process.env.ADMIN_EMAIL ?? "admin@unitedsport.uz");
    await page.type('input[name="password"]', process.env.ADMIN_PASSWORD ?? "admin123");
    await Promise.all([
      page.waitForFunction(() => location.pathname === "/admin", { timeout: 25000 }),
      page.click('button[type="submit"]'),
    ]);
  });

  const productUrl = await step("open a product", async () => {
    await page.goto(`${BASE}/admin/products?q=F-86`, { waitUntil: "networkidle2" });
    const link = await page.$("tbody a[href^='/admin/products/']");
    if (!link) throw new Error("product not found");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2" }), link.click()]);
    return page.url().replace(BASE, "");
  });

  await step("set a real price and save", async () => {
    // Uncheck "цена по запросу", then type the price into the price input.
    const boxes = await page.$$('input[type="checkbox"]');
    for (const box of boxes) {
      const label = await box.evaluate((el) => el.parentElement?.textContent?.trim() ?? "");
      if (label.includes("Цена по запросу")) {
        const checked = await box.evaluate((el) => el.checked);
        if (checked) await box.click();
      }
    }
    const priceInput = await page.$$('input[type="number"]');
    // First number field inside the price card is "Цена".
    let target = null;
    for (const input of priceInput) {
      const label = await input.evaluate(
        (el) => el.closest("label")?.querySelector("span")?.textContent?.trim() ?? "",
      );
      if (label === "Цена") { target = input; break; }
    }
    if (!target) throw new Error("price field not found");
    await target.click({ clickCount: 3 });
    await target.type(String(PRICE));

    await Promise.all([
      page.waitForFunction(
        () => [...document.querySelectorAll("p")].some((p) => p.textContent?.includes("Сохранено")),
        { timeout: 25000 },
      ),
      page.evaluate(() => {
        const button = [...document.querySelectorAll("button")].find((b) =>
          b.textContent?.includes("Сохранить товар"),
        );
        button?.click();
      }),
    ]);
    return `${PRICE}`;
  });

  await step("price shows on the storefront", async () => {
    // Follow the admin's own "На сайте" link rather than guessing the slug.
    const href = await page.$eval("a[href^='/ru/product/']", (el) => el.getAttribute("href"));
    await page.goto(`${BASE}${href}`, { waitUntil: "networkidle2" });

    // Walk up from the <h1> to the block that also holds the quantity stepper:
    // that is the buy box. "Цена по запросу" legitimately appears further down
    // the page on the related-product cards, so the whole body is too broad.
    const buyBox = await page.evaluate(() => {
      let node = document.querySelector("h1");
      while (node && !(node.innerText ?? "").includes("Количество")) node = node.parentElement;
      return node?.innerText ?? "";
    });
    if (!buyBox) throw new Error("buy box not found");
    if (buyBox.includes("Цена по запросу")) throw new Error("still shows price-on-request");

    // Intl groups digits with non-breaking and narrow spaces; strip them all.
    const digits = buyBox.replace(/[\s\u00a0\u202f\u2009]/g, "");
    if (!digits.includes("4990000")) throw new Error(`price not rendered: ${buyBox.slice(0, 200)}`);
    return href;
  });

  await step("revert to price-on-request", async () => {
    await page.goto(`${BASE}${productUrl}`, { waitUntil: "networkidle2" });
    const boxes = await page.$$('input[type="checkbox"]');
    for (const box of boxes) {
      const label = await box.evaluate((el) => el.parentElement?.textContent?.trim() ?? "");
      if (label.includes("Цена по запросу")) {
        const checked = await box.evaluate((el) => el.checked);
        if (!checked) await box.click();
      }
    }
    await Promise.all([
      page.waitForFunction(
        () => [...document.querySelectorAll("p")].some((p) => p.textContent?.includes("Сохранено")),
        { timeout: 25000 },
      ),
      page.evaluate(() => {
        const button = [...document.querySelectorAll("button")].find((b) =>
          b.textContent?.includes("Сохранить товар"),
        );
        button?.click();
      }),
    ]);
    return "reverted";
  });
} catch {
  // step() already reported it
} finally {
  if (problems.length) console.log("\nproblems:\n" + [...new Set(problems)].slice(0, 6).join("\n"));
  console.log(failures === 0 ? "\nALL OK" : `\n${failures} FAILED`);
  await browser.close();
  process.exitCode = failures === 0 ? 0 : 1;
}
