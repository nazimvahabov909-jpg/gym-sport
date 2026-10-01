import { cache } from "react";
import { db } from "@/lib/db";
import type { Locale } from "@/i18n/routing";
import { toNumber } from "@/lib/format";
import { buildSafe } from "@/lib/safe-query";
import type { Prisma } from "@/generated/prisma/client";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  image: string | null;
  imageAlt: string;
  price: number;
  oldPrice: number | null;
  priceOnRequest: boolean;
  inStock: boolean;
  isNew: boolean;
};

export type CategoryNode = {
  id: number;
  key: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
  children: CategoryNode[];
};

const cardSelect = (locale: Locale) =>
  ({
    id: true,
    sku: true,
    price: true,
    oldPrice: true,
    priceOnRequest: true,
    stockStatus: true,
    isNew: true,
    brand: { select: { name: true } },
    translations: { where: { locale }, select: { name: true, slug: true } },
    images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
  }) satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: ReturnType<typeof cardSelect> }>;

function toCard(row: CardRow): ProductCardData {
  const t = row.translations[0];
  const price = toNumber(row.price);
  const name = t?.name ?? `#${row.id}`;
  return {
    id: row.id,
    slug: t?.slug ?? String(row.id),
    name,
    sku: row.sku,
    brand: row.brand?.name ?? null,
    image: row.images[0]?.url ?? null,
    imageAlt: row.images[0]?.alt ?? name,
    price,
    oldPrice: row.oldPrice ? toNumber(row.oldPrice) : null,
    priceOnRequest: row.priceOnRequest || price <= 0,
    inStock: row.stockStatus === "IN_STOCK",
    isNew: row.isNew,
  };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export const getCategoryTree = cache(async (locale: Locale): Promise<CategoryNode[]> =>
  buildSafe("categories", async () => {
  const rows = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      key: true,
      parentId: true,
      image: true,
      translations: { where: { locale }, select: { name: true, slug: true } },
      _count: { select: { products: true } },
    },
  });

  const nodes = new Map<number, CategoryNode & { parentId: number | null }>();
  for (const row of rows) {
    const t = row.translations[0];
    nodes.set(row.id, {
      id: row.id,
      key: row.key,
      parentId: row.parentId,
      name: t?.name ?? row.key,
      slug: t?.slug ?? row.key,
      image: row.image,
      productCount: row._count.products,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId !== null ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  // A parent's count is the sum of its branch — products only sit on leaves.
  const rollUp = (node: CategoryNode): number => {
    const own = node.productCount + node.children.reduce((sum, c) => sum + rollUp(c), 0);
    node.productCount = own;
    return own;
  };
  roots.forEach(rollUp);

  return roots;
  }, []),
);

export const getCategoryBySlug = cache(async (locale: Locale, slug: string) => {
  const translation = await db.categoryTranslation.findUnique({
    where: { locale_slug: { locale, slug } },
    include: { category: { select: { id: true, key: true, parentId: true, isActive: true, image: true } } },
  });
  if (!translation || !translation.category.isActive) return null;
  return translation;
});

/** Root → … → category, for breadcrumbs and canonical URLs. */
export const getCategoryPath = cache(async (locale: Locale, categoryId: number) => {
  // One query for the whole tree: the walk below is cheap and avoids a
  // self-referential await chain (which TypeScript cannot type).
  const rows = await db.category.findMany({
    select: {
      id: true,
      parentId: true,
      translations: { where: { locale }, select: { name: true, slug: true } },
    },
  });
  const byId = new Map(rows.map((row) => [row.id, row]));

  const path: { id: number; name: string; slug: string }[] = [];
  let current: number | null = categoryId;
  // Depth is 2 in practice; the guard stops a cycle from hanging the request.
  for (let depth = 0; current !== null && depth < 8; depth += 1) {
    const row = byId.get(current);
    if (!row) break;
    const t = row.translations[0];
    path.unshift({ id: row.id, name: t?.name ?? String(row.id), slug: t?.slug ?? String(row.id) });
    current = row.parentId;
  }
  return path;
});

/** The category plus every descendant — a parent page lists the whole branch. */
export const getCategoryBranchIds = cache(async (categoryId: number): Promise<number[]> => {
  const all = await db.category.findMany({ select: { id: true, parentId: true } });
  const childrenOf = new Map<number, number[]>();
  for (const row of all) {
    if (row.parentId === null) continue;
    childrenOf.set(row.parentId, [...(childrenOf.get(row.parentId) ?? []), row.id]);
  }
  const out: number[] = [];
  const walk = (id: number) => {
    out.push(id);
    for (const child of childrenOf.get(id) ?? []) walk(child);
  };
  walk(categoryId);
  return out;
});

// ─── Products ───────────────────────────────────────────────────────────────

export type ProductSort = "newest" | "name" | "priceAsc" | "priceDesc";

const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }, { id: "desc" }],
  name: [{ sortOrder: "asc" }, { id: "asc" }],
  priceAsc: [{ price: "asc" }, { id: "asc" }],
  priceDesc: [{ price: "desc" }, { id: "asc" }],
};

export type ProductListParams = {
  locale: Locale;
  categoryIds?: number[];
  brandSlugs?: string[];
  query?: string;
  inStockOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
};

export async function listProducts(params: ProductListParams) {
  const {
    locale,
    categoryIds,
    brandSlugs,
    query,
    inStockOnly = false,
    sort = "name",
    page = 1,
    perPage = 24,
  } = params;

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (categoryIds?.length) where.categories = { some: { categoryId: { in: categoryIds } } };
  if (brandSlugs?.length) where.brand = { slug: { in: brandSlugs } };
  if (inStockOnly) where.stockStatus = "IN_STOCK";
  if (query?.trim()) {
    const q = query.trim();
    where.OR = [
      { sku: { contains: q } },
      { translations: { some: { locale, name: { contains: q } } } },
      { brand: { name: { contains: q } } },
    ];
  }

  const safePage = Math.max(1, Math.trunc(page));
  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: ORDER_BY[sort],
      skip: (safePage - 1) * perPage,
      take: perPage,
      select: cardSelect(locale),
    }),
    db.product.count({ where }),
  ]);

  return {
    products: rows.map(toCard),
    total,
    page: safePage,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export const getFeaturedProducts = cache(async (locale: Locale, take = 8) =>
  buildSafe(
    "featured products",
    async () => {
      const rows = await db.product.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { sortOrder: "asc" },
        take,
        select: cardSelect(locale),
      });
      return rows.map(toCard);
    },
    [],
  ),
);

/**
 * A spread across the top-level sections rather than whichever rows happen to
 * be newest — an imported catalogue shares one timestamp, so "latest" would
 * otherwise show eight variations of the same accessory.
 */
export const getDiverseProducts = cache(async (locale: Locale, take = 8) =>
  buildSafe("diverse products", async () => {
  const roots = await db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, children: { select: { id: true } } },
  });

  const perRoot = await Promise.all(
    roots.map((root) =>
      db.product.findMany({
        where: {
          isActive: true,
          images: { some: {} },
          categories: { some: { categoryId: { in: [root.id, ...root.children.map((c) => c.id)] } } },
        },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take,
        select: cardSelect(locale),
      }),
    ),
  );

  // Round-robin so the row alternates cardio → strength → accessories.
  const out: CardRow[] = [];
  for (let i = 0; out.length < take && i < take; i += 1) {
    for (const bucket of perRoot) {
      if (bucket[i] && out.length < take) out.push(bucket[i]);
    }
  }
  return out.map(toCard);
  }, []),
);

export const getLatestProducts = cache(async (locale: Locale, take = 8) =>
  buildSafe(
    "latest products",
    async () => {
      const rows = await db.product.findMany({
        where: { isActive: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take,
        select: cardSelect(locale),
      });
      return rows.map(toCard);
    },
    [],
  ),
);

export const getProductBySlug = cache(async (locale: Locale, slug: string) => {
  const translation = await db.productTranslation.findUnique({
    where: { locale_slug: { locale, slug } },
    include: {
      product: {
        include: {
          brand: true,
          images: { orderBy: { sortOrder: "asc" } },
          specs: { where: { locale }, orderBy: { sortOrder: "asc" } },
          categories: { include: { category: { select: { id: true } } } },
          reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
  if (!translation || !translation.product.isActive) return null;
  return translation;
});

export async function getRelatedProducts(locale: Locale, productId: number, categoryIds: number[], take = 8) {
  if (categoryIds.length === 0) return [];
  const rows = await db.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    orderBy: { sortOrder: "asc" },
    take,
    select: cardSelect(locale),
  });
  return rows.map(toCard);
}

/** Every locale's slug for one product — needed for hreflang alternates. */
export const getProductSlugsByLocale = cache(async (productId: number) => {
  const rows = await db.productTranslation.findMany({
    where: { productId },
    select: { locale: true, slug: true },
  });
  return Object.fromEntries(rows.map((r) => [r.locale, r.slug])) as Partial<Record<Locale, string>>;
});

export const getCategorySlugsByLocale = cache(async (categoryId: number) => {
  const rows = await db.categoryTranslation.findMany({
    where: { categoryId },
    select: { locale: true, slug: true },
  });
  return Object.fromEntries(rows.map((r) => [r.locale, r.slug])) as Partial<Record<Locale, string>>;
});

// ─── Brands ─────────────────────────────────────────────────────────────────

export const getBrands = cache(async () =>
  buildSafe("brands", () =>
    db.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      _count: { select: { products: true } },
      },
    }),
    [],
  ),
);

export const getBrandBySlug = cache(async (locale: Locale, slug: string) => {
  return db.brand.findFirst({
    where: { slug, isActive: true },
    include: { translations: { where: { locale } } },
  });
});

/** Brand counts scoped to the current category/search, for the filter panel. */
export async function getBrandFacets(params: {
  categoryIds?: number[];
  query?: string;
  locale: Locale;
}) {
  const where: Prisma.ProductWhereInput = { isActive: true, brandId: { not: null } };
  if (params.categoryIds?.length) {
    where.categories = { some: { categoryId: { in: params.categoryIds } } };
  }
  if (params.query?.trim()) {
    const q = params.query.trim();
    where.OR = [
      { sku: { contains: q } },
      { translations: { some: { locale: params.locale, name: { contains: q } } } },
      { brand: { name: { contains: q } } },
    ];
  }

  const grouped = await db.product.groupBy({
    by: ["brandId"],
    where,
    _count: { _all: true },
  });
  if (grouped.length === 0) return [];

  const brands = await db.brand.findMany({
    where: { id: { in: grouped.map((g) => g.brandId!).filter(Boolean) } },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: "asc" },
  });

  return brands.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    count: grouped.find((g) => g.brandId === brand.id)?._count._all ?? 0,
  }));
}
