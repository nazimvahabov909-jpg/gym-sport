/** Cyrillic + Turkic letters the browser's NFD pass cannot fold on its own. */
const CHAR_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ә: "a", ғ: "g", қ: "q", ң: "ng", ө: "o", ұ: "u", ү: "u", һ: "h", ї: "yi",
  і: "i", є: "ye", ў: "o", ҳ: "h", ҷ: "j",
  ə: "e", ı: "i", İ: "i", ö: "o", ü: "u", ç: "c", ş: "s", ğ: "g",
  "№": "no", "&": "and", "+": "plus", "×": "x",
};

/**
 * URL-safe slug that survives Russian, Uzbek and Azerbaijani titles.
 * Latin diacritics are folded with NFD; everything else goes through CHAR_MAP.
 */
export function slugify(input: string): string {
  const lowered = input.trim().toLowerCase();
  let out = "";
  for (const char of lowered) {
    if (char in CHAR_MAP) {
      out += CHAR_MAP[char];
      continue;
    }
    const folded = char.normalize("NFD").replace(/[̀-ͯ]/g, "");
    out += folded;
  }
  return out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180)
    .replace(/-+$/g, "");
}

/** Appends -2, -3 … until the slug is free within the given set (mutates it). */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const seed = base || "item";
  let candidate = seed;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${seed}-${n}`;
    n += 1;
  }
  taken.add(candidate);
  return candidate;
}
