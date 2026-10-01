import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { alternatesFor, openGraph, samePath } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog/CatalogView";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("catalog.title"),
    description: t("home.seoText").slice(0, 300),
    alternates: alternatesFor(locale, samePath("/catalog")),
    openGraph: openGraph({ title: t("catalog.title"), locale, path: "/catalog" }),
  };
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("catalog.title") }]} />
      <h1 className="mb-6 text-2xl font-extrabold md:text-4xl">{t("catalog.title")}</h1>
      <CatalogView locale={locale} searchParams={sp} basePath="/catalog" />
    </div>
  );
}
