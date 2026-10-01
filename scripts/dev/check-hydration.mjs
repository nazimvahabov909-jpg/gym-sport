/** Loads pages with a Grammarly-style body mutation and reports hydration errors. */
import puppeteer from "puppeteer-core";
const BASE = "http://localhost:3001";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true, args: ["--no-sandbox"],
});
for (const path of ["/ru", "/ru/catalog", "/ru/product/ferro-abb-crunch", "/admin/login"]) {
  const page = await browser.newPage();
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push(String(e)));
  // Mimic an extension that stamps attributes onto <body> before hydration.
  await page.evaluateOnNewDocument(() => {
    const stamp = () => {
      if (!document.body) return;
      document.body.setAttribute("data-new-gr-c-s-check-loaded", "14.1332.0");
      document.body.setAttribute("data-gr-ext-installed", "");
    };
    document.addEventListener("readystatechange", stamp);
    new MutationObserver(stamp).observe(document.documentElement, { childList: true });
  });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  const hyd = errs.filter((e) => /hydrat/i.test(e));
  console.log(`${hyd.length === 0 ? "✓" : "✗"} ${path.padEnd(32)} hydration errors: ${hyd.length}`);
  if (hyd.length) console.log("   " + hyd[0].slice(0, 180));
  await page.close();
}
await browser.close();
