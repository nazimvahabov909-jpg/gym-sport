import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { getBrandBySlug } from "@/lib/queries/catalog";
import { alternatesFor, openGraph } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog/CatalogView";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateStaticParams() {
  const brands = await db.brand.findMany({ where: { isActive: true }, select: { slug: true } });
  return brands;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const brand = await getBrandBySlug(locale, slug);
  if (!brand) return {};
  const description = brand.translations[0]?.metaDescription ?? brand.translations[0]?.description ?? undefined;

  return {
    title: brand.name,
    description,
    alternates: alternatesFor(locale, () => `/brands/${slug}`),
    openGraph: openGraph({
      title: brand.name,
      description,
      locale,
      path: `/brands/${slug}`,
      images: brand.logo ? [brand.logo] : undefined,
    }),
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const [{ locale, slug }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const brand = await getBrandBySlug(locale, slug);
  if (!brand) notFound();

  const t = await getTranslations();
  const description = brand.translations[0]?.description;

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("brands.title"), href: "/brands" }, { name: brand.name }]} />

      <header className="mb-8 flex flex-wrap items-center gap-5">
        {brand.logo ? (
          <div className="flex h-16 items-center rounded-card border border-ink-100 px-5">
            <Image
              src={brand.logo}
              alt={brand.name}
              width={150}
              height={150}
              className="max-h-12 w-auto object-contain"
            />
          </div>
        ) : null}
        <div>
          <h1 className="text-2xl font-extrabold md:text-4xl">{brand.name}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-ink-600">{description}</p>
          ) : null}
        </div>
      </header>

      <CatalogView
        locale={locale}
        searchParams={{ ...sp, brand: slug }}
        basePath={`/brands/${slug}`}
      />
    </div>
  );
}
