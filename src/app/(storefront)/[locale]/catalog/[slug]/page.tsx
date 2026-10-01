import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import {
  getCategoryBranchIds,
  getCategoryBySlug,
  getCategoryPath,
  getCategorySlugsByLocale,
  getCategoryTree,
} from "@/lib/queries/catalog";
import { absolute, alternatesFor, breadcrumbJsonLd, jsonLdScript, openGraph } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CatalogView, type CatalogSearchParams } from "@/components/catalog/CatalogView";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateStaticParams() {
  const rows = await db.categoryTranslation.findMany({
    where: { category: { isActive: true } },
    select: { locale: true, slug: true },
  });
  return rows.filter((r) => (locales as readonly string[]).includes(r.locale));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const translation = await getCategoryBySlug(locale, slug);
  if (!translation) return {};

  const slugs = await getCategorySlugsByLocale(translation.categoryId);
  const title = translation.metaTitle ?? translation.name;

  return {
    title: translation.name,
    description: translation.metaDescription ?? undefined,
    alternates: alternatesFor(locale, (l) => (slugs[l] ? `/catalog/${slugs[l]}` : null)),
    openGraph: openGraph({
      title,
      description: translation.metaDescription,
      locale,
      path: `/catalog/${slug}`,
      images: translation.category.image ? [translation.category.image] : undefined,
    }),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ locale, slug }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const translation = await getCategoryBySlug(locale, slug);
  if (!translation) notFound();

  const [t, path, branchIds, tree] = await Promise.all([
    getTranslations(),
    getCategoryPath(locale, translation.categoryId),
    getCategoryBranchIds(translation.categoryId),
    getCategoryTree(locale),
  ]);

  const findNode = (id: number) => {
    const stack = [...tree];
    while (stack.length) {
      const node = stack.pop()!;
      if (node.id === id) return node;
      stack.push(...node.children);
    }
    return null;
  };
  const node = findNode(translation.categoryId);

  const crumbs = [
    { name: t("catalog.title"), href: "/catalog" },
    ...path.map((step) => ({ name: step.name, href: `/catalog/${step.slug}` })),
  ];

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={crumbs} />

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold md:text-4xl">{translation.name}</h1>
        {translation.description ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">
            {translation.description}
          </p>
        ) : null}
      </header>

      <CatalogView
        locale={locale}
        searchParams={sp}
        categoryIds={branchIds}
        subcategories={node?.children}
        basePath={`/catalog/${slug}`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: t("nav.home"), url: absolute(`/${locale}`) },
              { name: t("catalog.title"), url: absolute(`/${locale}/catalog`) },
              ...path.map((step) => ({
                name: step.name,
                url: absolute(`/${locale}/catalog/${step.slug}`),
              })),
            ]),
          ),
        }}
      />
    </div>
  );
}
