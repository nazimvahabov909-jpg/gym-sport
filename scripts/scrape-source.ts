/**
 * Pulls the catalogue off the live ocStore site into a JSON file plus local
 * image files, so the DB import can be re-run offline and idempotently.
 *
 *   npm run scrape
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import iconv from "iconv-lite";

const ORIGIN = "https://unitedsport.uz";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const OUT_JSON = path.join(process.cwd(), "scripts", "data", "catalog.json");
const IMG_DIR = path.join(process.cwd(), "public", "media", "products");

/** ocStore `path=` values → our category keys. Names are the Russian originals. */
const CATEGORY_TREE = [
  {
    key: "cardio",
    legacyPath: "189",
    name: "Кардиотренажеры",
    children: [
      { key: "treadmills", legacyPath: "189_193", name: "Беговые дорожки" },
      { key: "elliptical", legacyPath: "189_194", name: "Эллиптические тренажёры" },
      { key: "exercise-bikes", legacyPath: "189_195", name: "Велотренажёры" },
      { key: "rowing", legacyPath: "189_196", name: "Гребные тренажеры" },
      { key: "steppers", legacyPath: "189_198", name: "Степперы" },
    ],
  },
  {
    key: "strength",
    legacyPath: "190",
    name: "Силовые тренажеры",
    children: [
      { key: "built-in-weight", legacyPath: "190_199", name: "Встроенный вес" },
      { key: "free-weight", legacyPath: "190_200", name: "Свободный вес" },
      { key: "benches-racks", legacyPath: "190_201", name: "Скамьи и стойки" },
    ],
  },
  {
    key: "accessories",
    legacyPath: "191",
    name: "Фитнес аксессуары",
    children: [
      { key: "expanders", legacyPath: "191_202", name: "Эспандеры" },
      { key: "weights", legacyPath: "191_203", name: "Груз" },
      { key: "jump-ropes", legacyPath: "191_204", name: "Скакалки" },
      { key: "hoops", legacyPath: "191_205", name: "Обруч" },
      { key: "mats", legacyPath: "191_206", name: "Коврики" },
      { key: "balls", legacyPath: "191_207", name: "Мячи" },
      { key: "abs", legacyPath: "191_213", name: "Тренажеры для пресса" },
    ],
  },
] as const;

export type ScrapedProduct = {
  legacyId: number;
  name: string;
  sku: string | null;
  brand: string | null;
  inStock: boolean;
  description: string | null;
  images: string[]; // paths relative to /public
  categoryKeys: string[];
};

async function fetchText(url: string, attempt = 1): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    if (attempt >= 3) throw err;
    await new Promise((r) => setTimeout(r, 800 * attempt));
    return fetchText(url, attempt + 1);
  }
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

const strip = (html: string) => decode(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));

/**
 * A slice of the catalogue was stored as cp1251 bytes and then served as UTF-8,
 * so "Эспандеры" arrives as "Р­СЃРїР°РЅРґРµСЂС‹".
 *
 * Re-encoding to cp1251 gives the original bytes back — but only if the text
 * really was mangled that way. The test is whether those bytes are themselves
 * valid multi-byte UTF-8; correct Cyrillic ("Скакалка") fails it, so healthy
 * strings are left untouched.
 */
function repairEncoding(text: string) {
  const strictUtf8 = new TextDecoder("utf-8", { fatal: true });
  let out = text;
  for (let pass = 0; pass < 2; pass += 1) {
    if (!/[\u0080-\u04FF]/.test(out)) break;
    let bytes: Buffer;
    try {
      bytes = iconv.encode(out, "win1251");
    } catch {
      break;
    }
    // iconv substitutes "?" for anything cp1251 cannot hold — that means the
    // string was never cp1251 to begin with.
    if (bytes.includes(0x3f) && !out.includes("?")) break;
    if (!bytes.some((b) => b >= 0x80)) break;
    let decoded: string;
    try {
      decoded = strictUtf8.decode(bytes);
    } catch {
      break;
    }
    if (decoded === out) break;
    out = decoded;
  }
  return out;
}

/** Brand is not linked on the live site, so derive it from the product title. */
const BRANDS: { name: string; match: RegExp }[] = [
  { name: "Ferro", match: /\bferr?ro?\b|\bferro\b/i },
  { name: "VolksGym", match: /\bvolksgym\b/i },
  { name: "MBH Fitness", match: /\bmbh\b/i },
  { name: "Kettler", match: /\bkettler\b/i },
  { name: "MuscleTech", match: /\bmuscletech\b/i },
  { name: "LiveUp", match: /\bliveup\b/i },
  { name: "Krega", match: /\bkrega\b/i },
];

function detectBrand(name: string) {
  return BRANDS.find((b) => b.match.test(name))?.name ?? null;
}

/** `/image/cache/catalog/21-1000x1000.jpg` → `/image/catalog/21.jpg` (the original). */
function originalImageUrl(cachedPath: string) {
  const bare = cachedPath.replace(/^\/image\/cache\//, "").replace(/-\d+x\d+(\.\w+)$/, "$1");
  return `${ORIGIN}/image/${bare}`;
}

async function downloadImage(remote: string): Promise<string | null> {
  const fileName = decodeURIComponent(remote.split("/").pop() ?? "").replace(/[^\w.\-]/g, "_");
  if (!fileName) return null;
  const dest = path.join(IMG_DIR, fileName);
  const publicPath = `/media/products/${fileName}`;
  if (existsSync(dest)) return publicPath;
  try {
    const res = await fetch(remote, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 1024) return null; // 404 pages served as HTML
    await writeFile(dest, buf);
    return publicPath;
  } catch {
    return null;
  }
}

async function collectProductIds(legacyPath: string): Promise<number[]> {
  const html = await fetchText(
    `${ORIGIN}/index.php?route=product/category&path=${legacyPath}&limit=100`,
  );
  const ids = [...html.matchAll(/product_id=(\d+)/g)].map((m) => Number(m[1]));
  return [...new Set(ids)];
}

async function scrapeProduct(legacyId: number): Promise<Omit<ScrapedProduct, "categoryKeys"> | null> {
  const html = await fetchText(`${ORIGIN}/index.php?route=product/product&product_id=${legacyId}`);

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const name = h1 ? repairEncoding(strip(h1[1])) : "";
  if (!name) return null;

  // The label sits in a <span>; the value is the text node right after it.
  const skuMatch = html.match(/Код\s*Товара:*\s*<\/span>([^<]+)/i);
  const sku = skuMatch ? repairEncoding(decode(skuMatch[1])) || null : null;

  const stockMatch = html.match(/Наличие:*\s*<\/span>([^<]+)/i);
  const inStock = stockMatch ? !/нет|отсут/i.test(stockMatch[1]) : true;

  const descMatch = html.match(/id="tab-description"[^>]*>([\s\S]*?)<\/div>/);
  const description = descMatch ? repairEncoding(strip(descMatch[1])) || null : null;

  const cached = [...html.matchAll(/\/image\/cache\/catalog\/[^"'\s)]+/g)].map((m) => m[0]);
  const originals = [...new Set(cached.map(originalImageUrl))];
  const images: string[] = [];
  for (const url of originals) {
    const local = await downloadImage(url);
    if (local && !images.includes(local)) images.push(local);
  }

  return { legacyId, name, sku, brand: detectBrand(name), inStock, description, images };
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  await mkdir(path.dirname(OUT_JSON), { recursive: true });

  const leaves = CATEGORY_TREE.flatMap((p) => p.children.map((c) => ({ ...c, parentKey: p.key })));
  const byProduct = new Map<number, string[]>();

  for (const leaf of leaves) {
    const ids = await collectProductIds(leaf.legacyPath);
    process.stdout.write(`· ${leaf.key.padEnd(18)} ${String(ids.length).padStart(3)} products\n`);
    for (const id of ids) {
      const keys = byProduct.get(id) ?? [];
      if (!keys.includes(leaf.key)) keys.push(leaf.key);
      byProduct.set(id, keys);
    }
  }

  const products: ScrapedProduct[] = [];
  let done = 0;
  for (const [legacyId, categoryKeys] of byProduct) {
    const p = await scrapeProduct(legacyId);
    done += 1;
    if (!p) {
      process.stdout.write(`  ! ${legacyId} skipped\n`);
      continue;
    }
    products.push({ ...p, categoryKeys });
    if (done % 20 === 0) process.stdout.write(`  … ${done}/${byProduct.size}\n`);
  }

  await writeFile(
    OUT_JSON,
    JSON.stringify({ scrapedAt: new Date().toISOString(), categories: CATEGORY_TREE, products }, null, 2),
  );
  process.stdout.write(`\n✓ ${products.length} products → ${path.relative(process.cwd(), OUT_JSON)}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
