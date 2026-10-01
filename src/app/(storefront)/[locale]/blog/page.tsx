import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPosts } from "@/lib/queries/content";
import { formatDate } from "@/lib/format";
import { alternatesFor, openGraph, samePath } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("blog.title"),
    alternates: alternatesFor(locale, samePath("/blog")),
    openGraph: openGraph({ title: t("blog.title"), locale, path: "/blog" }),
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, posts] = await Promise.all([getTranslations(), getPosts(locale)]);

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("blog.title") }]} />
      <h1 className="text-2xl font-extrabold md:text-4xl">{t("blog.title")}</h1>

      {posts.length === 0 ? (
        <p className="mt-8 rounded-card border border-dashed border-ink-200 px-6 py-16 text-center text-sm text-ink-500">
          {t("blog.empty")}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-ink-100">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <time
                  dateTime={post.publishedAt.toISOString()}
                  className="mt-4 block text-xs font-semibold uppercase tracking-wider text-ink-400"
                >
                  {formatDate(post.publishedAt, locale)}
                </time>
                <h2 className="clamp-2 mt-2 text-lg font-bold leading-snug transition group-hover:text-brand-600">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="clamp-3 mt-2 text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
                ) : null}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
