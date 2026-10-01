import puppeteer from "puppeteer-core";
const [, , url, w = "390"] = process.argv;
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true, args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: 900 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
const out = await page.evaluate(() => {
  const body = document.body;
  const rows = [...document.querySelectorAll("main > *, main > * > section, main section")]
    .slice(0, 30)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      cls: (el.className?.toString?.() ?? "").slice(0, 60),
      h: Math.round(el.getBoundingClientRect().height),
    }))
    .filter((r) => r.h > 200);
  return { docHeight: document.documentElement.scrollHeight, bodyHeight: body.scrollHeight, rows };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
