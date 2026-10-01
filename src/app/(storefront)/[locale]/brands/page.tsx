import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getBrands } from "@/lib/queries/catalog";
import { alternatesFor, openGraph, samePath } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("brands.title"),
    description: t("brands.subtitle"),
    alternates: alternatesFor(locale, samePath("/brands")),
    openGraph: openGraph({ title: t("brands.title"), description: t("brands.subtitle"), locale, path: "/brands" }),
  };
}

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, brands] = await Promise.all([getTranslations(), getBrands()]);

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("brands.title") }]} />
      <h1 className="text-2xl font-extrabold md:text-4xl">{t("brands.title")}</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-600">{t("brands.subtitle")}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="flex flex-col items-center gap-4 rounded-card border border-ink-100 p-6 transition hover:border-ink-300 hover:shadow-card"
          >
            <div className="flex h-16 items-center">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={150}
                  height={150}
                  sizes="150px"
                  className="max-h-16 w-auto object-contain"
                />
              ) : (
                <span className="font-display text-lg font-bold">{brand.name}</span>
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-ink-900">{brand.name}</p>
              <p className="mt-0.5 text-xs text-ink-400">
                {t("catalog.productCount", { count: brand._count.products })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
