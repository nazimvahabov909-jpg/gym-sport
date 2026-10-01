/** Fetches the key pages in every locale and reports status + <title> + hreflang. */
const BASE = process.env.BASE ?? "http://localhost:3001";

const PATHS = {
  ru: ["", "/catalog", "/catalog/begovye-dorozhki", "/product/ferro-f-86plus", "/brands", "/blog", "/contacts", "/cart"],
  uz: ["", "/catalog", "/catalog/yugurish-yo-lkalari", "/product/ferro-f-86plus", "/brands", "/blog", "/contacts", "/cart"],
  en: ["", "/catalog", "/catalog/treadmills", "/product/ferro-f-86plus", "/brands", "/blog", "/contacts", "/cart"],
  az: ["", "/catalog", "/catalog/qacis-yollari", "/product/ferro-f-86plus", "/brands", "/blog", "/contacts", "/cart"],
};

let bad = 0;
for (const [locale, paths] of Object.entries(PATHS)) {
  for (const path of paths) {
    const url = `${BASE}/${locale}${path}`;
    const res = await fetch(url, { redirect: "manual" });
    const html = res.status === 200 ? await res.text() : "";
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() ?? "";
    // Next emits the attribute as hrefLang; HTML attributes are case-insensitive.
    const hreflangs = (html.match(/hreflang="/gi) ?? []).length;
    const canonical = /rel="canonical"/i.test(html);
    const lang = html.match(/<html lang="([^"]+)"/)?.[1] ?? "";
    const ok = res.status === 200 && title.length > 0 && (path === "/cart" || canonical);
    if (!ok) bad += 1;
    console.log(
      `${ok ? "✓" : "✗"} ${String(res.status).padEnd(3)} ${`/${locale}${path}`.padEnd(38)} lang=${lang.padEnd(6)} hreflang=${String(hreflangs).padEnd(2)} canon=${canonical ? "y" : "n"} ${title.slice(0, 48)}`,
    );
  }
}
console.log(bad === 0 ? "\nALL OK" : `\n${bad} FAILED`);
process.exitCode = bad === 0 ? 0 : 1;
