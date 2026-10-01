/**
 * Loads scripts/data/catalog.json into MySQL. Safe to re-run: categories match
 * on their machine key, brands on slug and products on legacyId.
 *
 *   npm run db:import
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugify, uniqueSlug } from "../src/lib/slug";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_NAMES,
  LOCALES,
  translateProductName,
  type Locale,
} from "./data/catalog-i18n";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

type SourceCategory = {
  key: string;
  legacyPath: string;
  name: string;
  children?: readonly SourceCategory[];
};

type SourceProduct = {
  legacyId: number;
  name: string;
  sku: string | null;
  brand: string | null;
  inStock: boolean;
  description: string | null;
  images: string[];
  categoryKeys: string[];
};

const BRAND_SITES: Record<string, string | null> = {
  Ferro: null,
  VolksGym: null,
  "MBH Fitness": "https://www.mbhfitness.com",
  Kettler: "https://www.kettler.de",
  MuscleTech: "https://www.muscletech.com",
  LiveUp: null,
  Krega: null,
};

async function upsertCategory(
  source: SourceCategory,
  parentId: number | null,
  sortOrder: number,
  slugPools: Map<Locale, Set<string>>,
) {
  const names = CATEGORY_NAMES[source.key];
  if (!names) throw new Error(`Missing translations for category "${source.key}"`);

  const category = await db.category.upsert({
    where: { key: source.key },
    create: { key: source.key, parentId, sortOrder, isActive: true },
    update: { parentId, sortOrder },
  });

  for (const locale of LOCALES) {
    const existing = await db.categoryTranslation.findUnique({
      where: { categoryId_locale: { categoryId: category.id, locale } },
    });
    const pool = slugPools.get(locale)!;
    const slug = existing?.slug ?? uniqueSlug(slugify(names[locale]) || source.key, pool);
    if (!existing) pool.add(slug);

    const description = CATEGORY_DESCRIPTIONS[source.key]?.[locale] ?? null;
    const data = {
      name: names[locale],
      slug,
      description,
      metaTitle: `${names[locale]} — United Sport`,
      metaDescription: description,
    };

    await db.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale } },
      create: { categoryId: category.id, locale, ...data },
      update: data,
    });
  }

  return category;
}

async function main() {
  const raw = await readFile(path.join(process.cwd(), "scripts", "data", "catalog.json"), "utf8");
  const source = JSON.parse(raw) as {
    categories: readonly SourceCategory[];
    products: SourceProduct[];
  };

  // ── Categories ────────────────────────────────────────────────────────────
  const categorySlugPools = new Map<Locale, Set<string>>();
  for (const locale of LOCALES) {
    const taken = await db.categoryTranslation.findMany({ where: { locale }, select: { slug: true } });
    categorySlugPools.set(locale, new Set(taken.map((t) => t.slug)));
  }

  const categoryIdByKey = new Map<string, number>();
  let parentOrder = 0;
  for (const parent of source.categories) {
    const created = await upsertCategory(parent, null, (parentOrder += 10), categorySlugPools);
    categoryIdByKey.set(parent.key, created.id);
    let childOrder = 0;
    for (const child of parent.children ?? []) {
      const c = await upsertCategory(child, created.id, (childOrder += 10), categorySlugPools);
      categoryIdByKey.set(child.key, c.id);
    }
  }
  console.log(`✓ categories: ${categoryIdByKey.size}`);

  // ── Brands ────────────────────────────────────────────────────────────────
  const brandNames = [...new Set(source.products.map((p) => p.brand).filter(Boolean))] as string[];
  const brandIdByName = new Map<string, number>();
  for (const [i, name] of brandNames.entries()) {
    const slug = slugify(name);
    const brand = await db.brand.upsert({
      where: { slug },
      create: { slug, name, sortOrder: i * 10, website: BRAND_SITES[name] ?? null },
      update: { name, website: BRAND_SITES[name] ?? null },
    });
    brandIdByName.set(name, brand.id);
  }
  console.log(`✓ brands: ${brandIdByName.size}`);

  // ── Products ──────────────────────────────────────────────────────────────
  const productSlugPools = new Map<Locale, Set<string>>();
  for (const locale of LOCALES) {
    const taken = await db.productTranslation.findMany({ where: { locale }, select: { slug: true } });
    productSlugPools.set(locale, new Set(taken.map((t) => t.slug)));
  }

  let order = 0;
  for (const item of source.products) {
    order += 10;
    const product = await db.product.upsert({
      where: { legacyId: item.legacyId },
      create: {
        legacyId: item.legacyId,
        sku: item.sku,
        brandId: item.brand ? brandIdByName.get(item.brand) ?? null : null,
        stockStatus: item.inStock ? "IN_STOCK" : "OUT_OF_STOCK",
        // The source shop hid every price; the admin fills these in.
        priceOnRequest: true,
        sortOrder: order,
      },
      update: {
        sku: item.sku,
        brandId: item.brand ? brandIdByName.get(item.brand) ?? null : null,
        stockStatus: item.inStock ? "IN_STOCK" : "OUT_OF_STOCK",
      },
    });

    for (const locale of LOCALES) {
      const name = translateProductName(item.name, locale);
      const existing = await db.productTranslation.findUnique({
        where: { productId_locale: { productId: product.id, locale } },
      });
      const pool = productSlugPools.get(locale)!;
      const slug =
        existing?.slug ??
        uniqueSlug(slugify(name) || `product-${item.legacyId}`, pool);
      if (!existing) pool.add(slug);

      const data = {
        name,
        slug,
        description: item.description,
        metaTitle: `${name} — United Sport`,
        metaDescription: item.description?.slice(0, 300) ?? null,
      };
      await db.productTranslation.upsert({
        where: { productId_locale: { productId: product.id, locale } },
        create: { productId: product.id, locale, ...data },
        update: data,
      });
    }

    await db.productImage.deleteMany({ where: { productId: product.id } });
    if (item.images.length) {
      await db.productImage.createMany({
        data: item.images.map((url, i) => ({
          productId: product.id,
          url,
          alt: item.name,
          sortOrder: i,
        })),
      });
    }

    await db.productCategory.deleteMany({ where: { productId: product.id } });
    const categoryIds = item.categoryKeys
      .map((k) => categoryIdByKey.get(k))
      .filter((id): id is number => typeof id === "number");
    if (categoryIds.length) {
      await db.productCategory.createMany({
        data: categoryIds.map((categoryId, i) => ({
          productId: product.id,
          categoryId,
          isPrimary: i === 0,
        })),
      });
    }
  }
  console.log(`✓ products: ${source.products.length}`);

  // Feature two products from each leaf category so the storefront's
  // "recommended" row shows range instead of eight near-identical items.
  const leaves = await db.category.findMany({
    where: { parentId: { not: null } },
    select: { id: true },
  });
  const featuredIds: number[] = [];
  for (const leaf of leaves) {
    const picks = await db.product.findMany({
      where: { categories: { some: { categoryId: leaf.id } }, images: { some: {} } },
      orderBy: { sortOrder: "asc" },
      take: 2,
      select: { id: true },
    });
    featuredIds.push(...picks.map((p) => p.id));
  }
  await db.product.updateMany({ where: {}, data: { isFeatured: false } });
  await db.product.updateMany({ where: { id: { in: featuredIds } }, data: { isFeatured: true } });
  console.log(`✓ featured: ${featuredIds.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
