/** Screenshot the viewport at a given scroll offset: node scripts/dev/scroll-shot.mjs <url> <out> <y> [w] [h] */
import puppeteer from "puppeteer-core";

const [, , url, out, y = "0", w = "1440", h = "1100"] = process.argv;
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
await page.evaluate((top) => window.scrollTo(0, top), Number(y));
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: out });
await browser.close();
console.log("ok");
