/**
 * Opens every full-screen overlay on a phone viewport and checks it actually
 * covers the viewport — `backdrop-filter`, `transform` and `filter` on an
 * ancestor silently turn `position: fixed` into "relative to that ancestor".
 */
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE ?? "http://localhost:3001";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true, args: ["--no-sandbox", "--hide-scrollbars"],
});

const probe = `(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { found: false };
  const r = d.getBoundingClientRect();
  const blockers = [];
  for (let el = d.parentElement; el && el !== document.body; el = el.parentElement) {
    const cs = getComputedStyle(el);
    const why = [];
    if (cs.transform !== 'none') why.push('transform');
    if (cs.filter !== 'none') why.push('filter');
    if (cs.backdropFilter && cs.backdropFilter !== 'none') why.push('backdrop-filter');
    if (cs.perspective !== 'none') why.push('perspective');
    if (why.length) blockers.push(el.tagName.toLowerCase() + ':' + why.join('+'));
  }
  return { found: true, top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width), vh: innerHeight, blockers };
})()`;

const cases = [
  { name: "mobil menyu", url: "/ru", open: 'b => b.getAttribute("aria-label") === "Меню"', full: true },
  { name: "filtr paneli", url: "/ru/catalog", open: 'b => (b.textContent || "").includes("Фильтры")', full: true },
  { name: "qiymət sorğusu", url: "/ru/product/ferro-abb-crunch", open: 'b => (b.textContent || "").includes("Узнать цену") || (b.textContent || "").includes("Заказать звонок")', full: false },
  { name: "əlaqə formu", url: "/ru/contacts", open: 'b => (b.textContent || "").includes("Заказать звонок")', full: false },
];

let bad = 0;
for (const c of cases) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}${c.url}`, { waitUntil: "networkidle2", timeout: 60000 });
  const clicked = await page.evaluate((sel) => {
    const match = eval(sel);
    const btn = [...document.querySelectorAll("button")].find(match);
    if (!btn) return false;
    btn.click();
    return true;
  }, c.open);
  await new Promise((r) => setTimeout(r, 700));
  const res = clicked ? await page.evaluate(probe) : { found: false, reason: "düymə tapılmadı" };

  // A full-screen sheet must cover the viewport; a centred modal only needs to
  // escape its ancestors, so only the blocker list matters there.
  // A sheet sizes itself to its content; what matters is that it is anchored
  // to the viewport edge, not that it fills the screen.
  const anchored = res.found && Math.abs(res.bottom - res.vh) <= 2;
  const ok = res.found && res.blockers.length === 0 && (!c.full || anchored);
  if (!ok) bad += 1;
  console.log(`${ok ? "✓" : "✗"} ${c.name.padEnd(18)} ${JSON.stringify(res)}`);
  await page.close();
}
await browser.close();
console.log(bad === 0 ? "\nHAMISI QAYDASINDA" : `\n${bad} PROBLEM`);
process.exitCode = bad === 0 ? 0 : 1;
