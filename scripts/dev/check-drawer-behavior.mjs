/** Exercises the mobile drawer: expand, navigate, close, scroll lock. */
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3001";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true, args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));

let bad = 0;
const check = async (name, fn) => {
  try {
    const v = await fn();
    console.log(`✓ ${name}${v ? ` — ${v}` : ""}`);
  } catch (e) {
    bad += 1;
    console.log(`✗ ${name} — ${e.message}`);
  }
};

const openDrawer = () =>
  page.evaluate(() => {
    [...document.querySelectorAll("button")]
      .find((b) => b.getAttribute("aria-label") === "Меню")?.click();
  });

await page.goto(`${BASE}/ru`, { waitUntil: "networkidle2", timeout: 60000 });

await check("açılır", async () => {
  await openDrawer();
  await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
  return "dialog göründü";
});

await check("arxa fon scroll kilidlənir", async () => {
  const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
  if (overflow !== "hidden") throw new Error(`body overflow = ${overflow}`);
  return overflow;
});

await check("alt-menyu açılır", async () => {
  const before = await page.$$eval('[role="dialog"] a', (a) => a.length);
  await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    dlg?.querySelector('button[aria-expanded="false"]')?.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  const after = await page.$$eval('[role="dialog"] a', (a) => a.length);
  if (after <= before) throw new Error(`linklər artmadı: ${before} → ${after}`);
  return `${before} → ${after} link`;
});

await check("Escape bağlayır", async () => {
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));
  if (await page.$('[role="dialog"]')) throw new Error("hələ açıqdır");
  const overflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
  if (overflow === "hidden") throw new Error("scroll kilidi qaldı");
  return "bağlandı, scroll bərpa olundu";
});

await check("link kliki keçid edir", async () => {
  await openDrawer();
  await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
  const href = await page.$eval('[role="dialog"] a[href*="/catalog/"]', (a) => a.getAttribute("href"));
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 25000 }),
    page.evaluate(() => {
      document.querySelector('[role="dialog"] a[href*="/catalog/"]')?.click();
    }),
  ]);
  const url = new URL(page.url()).pathname;
  if (!url.includes("/catalog/")) throw new Error(`keçmədi: ${url}`);
  if (await page.$('[role="dialog"]')) throw new Error("keçiddən sonra drawer açıq qaldı");
  return `${href} → ${url}`;
});

await check("fon kliki bağlayır", async () => {
  await openDrawer();
  await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
  await page.evaluate(() => {
    const overlay = document.querySelector('[role="dialog"]')?.parentElement?.firstElementChild;
    overlay?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 400));
  if (await page.$('[role="dialog"]')) throw new Error("bağlanmadı");
  return "bağlandı";
});

if (errs.length) console.log("\nkonsol xətaları:\n" + [...new Set(errs)].slice(0, 5).join("\n"));
console.log(bad === 0 ? "\nHAMISI QAYDASINDA" : `\n${bad} PROBLEM`);
await browser.close();
process.exitCode = bad === 0 ? 0 : 1;
