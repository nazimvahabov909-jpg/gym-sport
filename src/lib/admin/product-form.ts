import "server-only";
import { db } from "@/lib/db";
import { locales, type Locale } from "@/i18n/routing";
import { toNumber } from "@/lib/format";
import type { ProductFormValue } from "@/components/admin/ProductForm";

const emptyTranslation = (locale: Locale) => ({
  locale,
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
});

export function blankProduct(): ProductFormValue {
  return {
    sku: "",
    brandId: null,
    price: 0,
    oldPrice: null,
    priceOnRequest: true,
    stock: 0,
    stockStatus: "IN_STOCK",
    isActive: true,
    isFeatured: false,
    isNew: true,
    sortOrder: 0,
    categoryIds: [],
    images: [],
    specs: [],
    translations: locales.map(emptyTranslation),
  };
}

export async function loadProductForm(productId: number): Promise<ProductFormValue | null> {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      translations: true,
      images: { orderBy: { sortOrder: "asc" } },
      specs: { orderBy: { sortOrder: "asc" } },
      categories: { select: { categoryId: true } },
    },
  });
  if (!product) return null;

  return {
    id: product.id,
    sku: product.sku ?? "",
    brandId: product.brandId,
    price: toNumber(product.price),
    oldPrice: product.oldPrice === null ? null : toNumber(product.oldPrice),
    priceOnRequest: product.priceOnRequest,
    stock: product.stock,
    stockStatus: product.stockStatus,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    sortOrder: product.sortOrder,
    categoryIds: product.categories.map((c) => c.categoryId),
    images: product.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
    specs: product.specs
      .filter((s) => (locales as readonly string[]).includes(s.locale))
      .map((s) => ({ locale: s.locale as Locale, name: s.name, value: s.value })),
    translations: locales.map((locale) => {
      const t = product.translations.find((x) => x.locale === locale);
      return t
        ? {
            locale,
            name: t.name,
            slug: t.slug,
            shortDescription: t.shortDescription ?? "",
            description: t.description ?? "",
            metaTitle: t.metaTitle ?? "",
            metaDescription: t.metaDescription ?? "",
          }
        : emptyTranslation(locale);
    }),
  };
}

/** Flat "Parent → Child" list for the category picker. */
export async function categoryOptions() {
  const rows = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      parentId: true,
      key: true,
      translations: { where: { locale: "ru" }, select: { name: true } },
    },
  });
  const nameOf = (id: number) => {
    const row = rows.find((r) => r.id === id);
    return row?.translations[0]?.name ?? row?.key ?? String(id);
  };

  return rows.map((row) => ({
    id: row.id,
    label: row.parentId ? `${nameOf(row.parentId)} → ${nameOf(row.id)}` : nameOf(row.id),
  }));
}

export async function brandOptions() {
  return db.brand.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
}
