import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { staticParamsSafe } from "@/lib/safe-query";
import { getPostBySlug, getPostSlugsByLocale } from "@/lib/queries/content";
import { absolute, alternatesFor, jsonLdScript, openGraph } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  return staticParamsSafe(async () => {
    const rows = await db.postTranslation.findMany({
      where: { post: { isActive: true } },
      select: { locale: true, slug: true },
    });
    return rows.filter((r) => (locales as readonly string[]).includes(r.locale));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale, slug);
  if (!post) return {};
  const slugs = await getPostSlugsByLocale(post.postId);

  return {
    title: post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    alternates: alternatesFor(locale, (l) => (slugs[l] ? `/blog/${slugs[l]}` : null)),
    openGraph: openGraph({
      title: post.title,
      description: post.excerpt,
      locale,
      path: `/blog/${slug}`,
      images: post.post.image ? [post.post.image] : undefined,
      type: "article",
    }),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPostBySlug(locale, slug);
  if (!post) notFound();

  const t = await getTranslations();

  return (
    <article className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("blog.title"), href: "/blog" }, { name: post.title }]} />

      <div className="mx-auto max-w-3xl">
        <time
          dateTime={post.post.publishedAt.toISOString()}
          className="block text-xs font-semibold uppercase tracking-wider text-ink-400"
        >
          {formatDate(post.post.publishedAt, locale)}
        </time>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">{post.title}</h1>
        {post.excerpt ? <p className="mt-4 text-lg text-ink-600">{post.excerpt}</p> : null}

        {post.post.image ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-card bg-ink-100">
            <Image
              src={post.post.image}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        {post.content ? (
          <div className="prose-cms mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : null}

        <Link
          href="/blog"
          className="mt-10 inline-block border-b border-ink-300 pb-0.5 text-sm font-semibold text-ink-600 transition hover:border-brand-600 hover:text-brand-600"
        >
          ← {t("blog.backToBlog")}
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt ?? undefined,
            datePublished: post.post.publishedAt.toISOString(),
            dateModified: post.post.updatedAt.toISOString(),
            image: post.post.image ? absolute(post.post.image) : undefined,
            mainEntityOfPage: absolute(`/${locale}/blog/${slug}`),
            publisher: { "@type": "Organization", name: "United Sport" },
          }),
        }}
      />
    </article>
  );
}
