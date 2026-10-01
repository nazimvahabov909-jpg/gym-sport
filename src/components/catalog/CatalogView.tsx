import { getTranslations } from "next-intl/server";
import { PackageSearch } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/settings";
import {
  getBrandFacets,
  listProducts,
  type CategoryNode,
  type ProductSort,
} from "@/lib/queries/catalog";
import { ProductGrid } from "./ProductCard";
import { CatalogControls } from "./CatalogControls";
import { Pagination } from "./Pagination";

const SORTS: ProductSort[] = ["name", "newest", "priceAsc", "priceDesc"];
const PER_PAGE = 24;

export type CatalogSearchParams = {
  page?: string;
  sort?: string;
  brand?: string | string[];
  stock?: string;
  q?: string;
};

export async function CatalogView({
  locale,
  searchParams,
  categoryIds,
  subcategories,
  basePath,
  query,
}: {
  locale: Locale;
  searchParams: CatalogSearchParams;
  categoryIds?: number[];
  subcategories?: CategoryNode[];
  basePath: string;
  query?: string;
}) {
  const [t, settings] = await Promise.all([getTranslations(), getSettings()]);

  const sort = (SORTS.includes(searchParams.sort as ProductSort)
    ? searchParams.sort
    : "name") as ProductSort;
  const brandSlugs = searchParams.brand
    ? Array.isArray(searchParams.brand)
      ? searchParams.brand
      : [searchParams.brand]
    : [];
  const page = Number(searchParams.page ?? "1") || 1;

  const [result, brands] = await Promise.all([
    listProducts({
      locale,
      categoryIds,
      brandSlugs,
      query,
      inStockOnly: searchParams.stock === "1",
      sort,
      page,
      perPage: PER_PAGE,
    }),
    getBrandFacets({ categoryIds, query, locale }),
  ]);

  return (
    <>
      {subcategories?.length ? (
        <nav aria-label={t("catalog.subcategories")} className="mb-6 flex flex-wrap gap-2">
          {subcategories.map((child) => (
            <Link
              key={child.id}
              href={`/catalog/${child.slug}`}
              className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-600 hover:text-brand-600"
            >
              {child.name}
              <span className="ml-1.5 text-xs text-ink-400">{child.productCount}</span>
            </Link>
          ))}
        </nav>
      ) : null}

      <CatalogControls
        brands={brands}
        total={result.total}
        resultsLabel={t("catalog.allProducts")}
        labels={{
          filters: t("catalog.filters"),
          sort: t("catalog.sort"),
          brand: t("catalog.brand"),
          inStockOnly: t("catalog.inStockOnly"),
          apply: t("common.apply"),
          reset: t("common.reset"),
          close: t("common.close"),
          sortOptions: [
            { value: "name", label: t("catalog.sortNameAsc") },
            { value: "newest", label: t("catalog.sortNewest") },
            { value: "priceAsc", label: t("catalog.sortPriceAsc") },
            { value: "priceDesc", label: t("catalog.sortPriceDesc") },
          ],
        }}
      />

      <div className="mt-6">
        {result.products.length ? (
          <ProductGrid
            products={result.products}
            locale={locale}
            currency={settings.currency}
            priorityCount={4}
          />
        ) : (
          <div className="rounded-card border border-dashed border-ink-200 px-6 py-16 text-center">
            <PackageSearch className="mx-auto size-10 text-ink-300" aria-hidden />
            <h2 className="mt-4 text-lg font-bold">{t("catalog.nothingFound")}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
              {t("catalog.nothingFoundText")}
            </p>
          </div>
        )}
      </div>

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        basePath={basePath}
        searchParams={{
          sort: searchParams.sort,
          stock: searchParams.stock,
          q: searchParams.q,
          brand: brandSlugs,
        }}
      />
    </>
  );
}
