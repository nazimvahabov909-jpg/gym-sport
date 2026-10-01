/** Logs into the admin panel and opens every section, reporting failures. */
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3001";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@unitedsport.uz";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });

const problems = [];
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
page.on("response", (r) => r.status() >= 500 && problems.push(`${r.status()} ${r.url()}`));

let failures = 0;
const step = async (name, fn) => {
  try {
    const value = await fn();
    console.log(`✓ ${name}${value ? ` — ${value}` : ""}`);
  } catch (err) {
    failures += 1;
    console.log(`✗ ${name} — ${err.message}`);
  }
};

try {
  await step("login", async () => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle2" });
    await page.type('input[name="email"]', EMAIL);
    await page.type('input[name="password"]', PASSWORD);
    await Promise.all([
      page.waitForFunction(() => location.pathname === "/admin", { timeout: 25000 }),
      page.click('button[type="submit"]'),
    ]);
    const stats = await page.$$eval("a[href^='/admin/'] p, div p", (els) => els.length);
    return `dashboard rendered (${stats} blocks)`;
  });

  const sections = [
    ["/admin/orders", "Заказы"],
    ["/admin/leads", "Заявки"],
    ["/admin/products", "Товары"],
    ["/admin/products/new", "Новый товар"],
    ["/admin/categories", "Категории"],
    ["/admin/categories/new", "Новая категория"],
    ["/admin/brands", "Бренды"],
    ["/admin/brands/new", "Новый бренд"],
    ["/admin/customers", "Клиенты"],
    ["/admin/pages", "Страницы"],
    ["/admin/posts", "Блог"],
    ["/admin/posts/new", "Новая статья"],
    ["/admin/slides", "Слайдер"],
    ["/admin/slides/new", "Новый слайд"],
    ["/admin/settings", "Настройки"],
  ];

  for (const [path, heading] of sections) {
    await step(path, async () => {
      const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2" });
      if (res.status() !== 200) throw new Error(`HTTP ${res.status()}`);
      const h1 = await page.$eval("h1", (el) => el.textContent?.trim() ?? "");
      if (!h1.includes(heading)) throw new Error(`h1 is "${h1}", expected "${heading}"`);
      return h1;
    });
  }

  await step("open first order", async () => {
    await page.goto(`${BASE}/admin/orders`, { waitUntil: "networkidle2" });
    const link = await page.$("tbody a[href^='/admin/orders/']");
    if (!link) return "no orders yet";
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2" }), link.click()]);
    await page.waitForSelector('input[type="number"]', { timeout: 15000 });
    return page.url().replace(BASE, "");
  });

  await step("open first product", async () => {
    await page.goto(`${BASE}/admin/products`, { waitUntil: "networkidle2" });
    const link = await page.$("tbody a[href^='/admin/products/']");
    if (!link) throw new Error("no products listed");
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2" }), link.click()]);
    await page.waitForSelector("input", { timeout: 15000 });
    const tabs = await page.$$eval("button", (els) =>
      els.filter((e) => /Русский|English|Azərbaycan|O‘zbekcha/.test(e.textContent ?? "")).length,
    );
    if (tabs < 4) throw new Error(`expected 4 locale tabs, found ${tabs}`);
    return `${tabs} locale tabs`;
  });
} finally {
  if (problems.length) console.log("\nproblems:\n" + [...new Set(problems)].slice(0, 10).join("\n"));
  console.log(failures === 0 ? "\nALL OK" : `\n${failures} FAILED`);
  await browser.close();
  process.exitCode = failures === 0 ? 0 : 1;
}
