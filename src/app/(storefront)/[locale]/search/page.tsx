import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog/CatalogView";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  // Search result pages carry no SEO value and would dilute the catalogue.
  return { title: t("search.title"), robots: { index: false, follow: true } };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations();

  const query = (sp.q ?? "").trim();

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("search.title") }]} />
      <h1 className="text-2xl font-extrabold md:text-4xl">
        {query ? `${t("search.resultsFor")}: “${query}”` : t("search.title")}
      </h1>

      <div className="mt-6">
        {query.length >= 2 ? (
          <CatalogView locale={locale} searchParams={sp} query={query} basePath="/search" />
        ) : (
          <p className="rounded-card border border-dashed border-ink-200 px-6 py-16 text-center text-sm text-ink-500">
            {t("common.searchPlaceholder")}
          </p>
        )}
      </div>
    </div>
  );
}
