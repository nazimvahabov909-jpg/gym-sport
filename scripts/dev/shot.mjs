/**
 * Screenshot + layout audit helper.
 *   node scripts/dev/shot.mjs <url> <out.png> [width] [height] [--full]
 * Prints any element that overflows the viewport horizontally.
 */
import puppeteer from "puppeteer-core";

const [, , url, out, width = "390", height = "900", ...flags] = process.argv;
const full = flags.includes("--full");

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: Number(width), height: Number(height), deviceScaleFactor: 2 });

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 700));

const audit = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? "").slice(0, 110),
        left: Math.round(r.left),
        right: Math.round(r.right),
      });
    }
  }
  return {
    vw,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: offenders.slice(0, 14),
    title: document.title,
  };
});

if (out) await page.screenshot({ path: out, fullPage: full });
console.log(JSON.stringify({ status: response?.status(), ...audit, errors: errors.slice(0, 8) }, null, 1));
await browser.close();
