import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { htmlLang, locales, type Locale } from "@/i18n/routing";
import { absolute } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

/** One entry per URL, each carrying the full hreflang set for its siblings. */
function entry(
  paths: Partial<Record<Locale, string>>,
  locale: Locale,
  options: { lastModified?: Date; changeFrequency?: Entry["changeFrequency"]; priority?: number } = {},
): Entry | null {
  const self = paths[locale];
  // The home page's path is "", which is falsy — compare against undefined.
  if (self === undefined) return null;

  const languages: Record<string, string> = {};
  for (const l of locales) {
    if (paths[l] !== undefined) languages[htmlLang[l]] = absolute(`/${l}${paths[l]}`);
  }

  return {
    url: absolute(`/${locale}${self}`),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency ?? "weekly",
    priority: options.priority ?? 0.6,
    alternates: { languages },
  };
}

function sameForAll(path: string) {
  return Object.fromEntries(locales.map((l) => [l, path])) as Record<Locale, string>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: Entry[] = [];

  const push = (paths: Partial<Record<Locale, string>>, options?: Parameters<typeof entry>[2]) => {
    for (const locale of locales) {
      const row = entry(paths, locale, options);
      if (row) entries.push(row);
    }
  };

  push(sameForAll(""), { changeFrequency: "daily", priority: 1 });
  push(sameForAll("/catalog"), { changeFrequency: "daily", priority: 0.9 });
  push(sameForAll("/brands"), { priority: 0.5 });
  push(sameForAll("/blog"), { priority: 0.5 });
  push(sameForAll("/contacts"), { changeFrequency: "monthly", priority: 0.4 });

  try {
    const [categories, products, pages, posts] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true, translations: { select: { locale: true, slug: true } } },
      }),
      db.product.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true, translations: { select: { locale: true, slug: true } } },
      }),
      db.page.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true, translations: { select: { locale: true, slug: true } } },
      }),
      db.post.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true, translations: { select: { locale: true, slug: true } } },
      }),
    ]);

    const byLocale = (rows: { locale: string; slug: string }[], prefix: string) =>
      Object.fromEntries(
        rows
          .filter((r) => (locales as readonly string[]).includes(r.locale))
          .map((r) => [r.locale, `${prefix}/${r.slug}`]),
      ) as Partial<Record<Locale, string>>;

    for (const row of categories) {
      push(byLocale(row.translations, "/catalog"), {
        lastModified: row.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
    for (const row of products) {
      push(byLocale(row.translations, "/product"), {
        lastModified: row.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const row of pages) {
      push(byLocale(row.translations, "/info"), {
        lastModified: row.updatedAt,
        changeFrequency: "monthly",
        priority: 0.3,
      });
    }
    for (const row of posts) {
      push(byLocale(row.translations, "/blog"), {
        lastModified: row.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // A DB outage should still leave a valid sitemap with the static routes.
  }

  return entries;
}
