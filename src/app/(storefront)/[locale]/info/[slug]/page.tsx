import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { staticParamsSafe } from "@/lib/safe-query";
import { getPageBySlug, getPageSlugsByLocale } from "@/lib/queries/content";
import { alternatesFor, openGraph } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  return staticParamsSafe(async () => {
    const rows = await db.pageTranslation.findMany({
      where: { page: { isActive: true } },
      select: { locale: true, slug: true },
    });
    return rows.filter((r) => (locales as readonly string[]).includes(r.locale));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPageBySlug(locale, slug);
  if (!page) return {};
  const slugs = await getPageSlugsByLocale(page.pageId);

  return {
    title: page.title,
    description: page.metaDescription ?? undefined,
    alternates: alternatesFor(locale, (l) => (slugs[l] ? `/info/${slugs[l]}` : null)),
    openGraph: openGraph({
      title: page.title,
      description: page.metaDescription,
      locale,
      path: `/info/${slug}`,
    }),
  };
}

export default async function InfoPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getPageBySlug(locale, slug);
  if (!page) notFound();

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: page.title }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">{page.title}</h1>
        {page.content ? (
          <div className="prose-cms mt-6" dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : null}
      </div>
    </div>
  );
}
