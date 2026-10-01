import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Headset, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/settings";
import { alternatesFor, jsonLdScript, openGraph, samePath, websiteJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { db } from "@/lib/db";
import {
  getBrands,
  getCategoryTree,
  getDiverseProducts,
  getFeaturedProducts,
} from "@/lib/queries/catalog";
import { getPosts, getSlides } from "@/lib/queries/content";
import { Hero3D } from "@/components/home/Hero3D";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { CategoryDeck } from "@/components/home/CategoryDeck";
import { Reveal } from "@/components/home/Reveal";
import { Tilt } from "@/components/home/Tilt";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const title = `United Sport — ${t("common.tagline")}`;
  const description = t("home.seoText").slice(0, 300);

  return {
    title: { absolute: title },
    description,
    alternates: alternatesFor(locale, samePath("")),
    openGraph: openGraph({
      title,
      description,
      locale,
      path: "",
      images: ["/media/slides/slide1.jpg"],
    }),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, settings, slides, categories, latest, featured, brands, posts, productCount] =
    await Promise.all([
      getTranslations(),
      getSettings(),
      getSlides(locale),
      getCategoryTree(locale),
      getDiverseProducts(locale, 8),
      getFeaturedProducts(locale, 4),
      getBrands(),
      getPosts(locale, 3),
      db.product.count({ where: { isActive: true } }),
    ]);

  const benefits = [
    { Icon: Truck, title: t("home.benefits.delivery.title"), text: t("home.benefits.delivery.text") },
    { Icon: ShieldCheck, title: t("home.benefits.warranty.title"), text: t("home.benefits.warranty.text") },
    { Icon: Wrench, title: t("home.benefits.service.title"), text: t("home.benefits.service.text") },
    { Icon: Headset, title: t("home.benefits.support.title"), text: t("home.benefits.support.text") },
  ];

  // One curated photo per section, stacked at three depths in the turn-key
  // block. Category art is chosen by the admin, so the silhouettes read well at
  // small sizes — individual product shots often do not.
  const showcase = categories
    .map((category) => category.image)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  return (
    <>
      <Hero3D
        slides={slides}
        badge={t("home.heroBadge")}
        headline={t("home.heroTitle")}
        subheadline={t("home.heroSubtitle")}
        primaryCta={{ href: "/catalog", label: t("home.exploreCatalog") }}
        secondaryCta={{ href: "/contacts", label: t("home.talkToUs") }}
        scrollLabel={t("home.scroll")}
        navLabels={{ prev: t("common.prev"), next: t("common.next") }}
        stats={[
          { value: `${productCount}+`, label: t("home.stats.models") },
          { value: String(brands.length), label: t("home.stats.brands") },
          { value: "10+", label: t("home.stats.years") },
        ]}
      />

      <section className="border-b border-ink-100 py-8 md:py-10">
        <div className="container-page">
          <BrandMarquee brands={brands} />
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow={t("nav.catalog")}
              title={t("home.categoriesTitle")}
              href="/catalog"
              linkLabel={t("common.viewAll")}
            />
          </Reveal>
          <Reveal delay={90}>
            <CategoryDeck
              categories={categories}
              countLabel={(count) => t("catalog.productCount", { count })}
            />
          </Reveal>
        </div>
      </section>

      {latest.length ? (
        <section className="pb-14 md:pb-20">
          <div className="container-page">
            <Reveal>
              <SectionHeading
                eyebrow={t("home.popularEyebrow")}
                title={t("home.latestTitle")}
                href="/catalog?sort=newest"
                linkLabel={t("common.viewAll")}
              />
            </Reveal>
            <Reveal delay={90}>
              <ProductGrid
                products={latest}
                locale={locale}
                currency={settings.currency}
                priorityCount={4}
              />
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ── Turn-key: dark block with photos floating at three depths ─────── */}
      <section className="relative overflow-hidden bg-ink-900 py-16 text-white md:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="aurora -left-20 top-0 size-[22rem] bg-navy-600/60 md:size-[30rem]" />
          <span
            className="aurora bottom-[-20%] right-[-5%] size-[20rem] bg-brand-600/45 md:size-[28rem]"
            style={{ animationDelay: "-11s" }}
          />
          <div className="grid-veil absolute inset-0" />
        </div>

        <div className="container-page stage relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-brand-400">{t("home.turnkeyEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
              {t("home.turnkeyTitle")}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
              {t("home.turnkeyText")}
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map(({ Icon, title, text }) => (
                <li key={title} className="glass flex gap-3 rounded-xl p-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-brand-400" aria-hidden />
                  <span>
                    <span className="block text-sm font-bold">{title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-white/50">{text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/contacts"
              className="group mt-8 inline-flex items-center gap-2 border-b border-brand-500 pb-1 font-display text-sm font-bold uppercase tracking-wider"
            >
              {t("home.talkToUs")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>

          {showcase.length ? (
            <Reveal delay={120}>
              <Tilt max={11} scale={1} className="relative mx-auto aspect-square w-full max-w-md">
                <div
                  className="absolute inset-0 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm"
                  style={{ transform: "translateZ(-40px)" }}
                />
                {showcase.map((url, i) => {
                  // Offset corners so each layer keeps a visible edge instead of
                  // disappearing behind the one in front of it.
                  const placement = [
                    "left-[19%] top-[17%] h-[60%] w-[64%] z-30",
                    "left-0 top-0 size-[38%] z-20",
                    "bottom-0 right-0 size-[40%] z-10",
                  ][i];
                  return (
                    <div
                      key={url}
                      className={`absolute overflow-hidden rounded-2xl border border-white/10 bg-white ${placement}`}
                      style={{
                        transform: `translateZ(${[70, 40, 25][i]}px)`,
                        animation: `var(--animate-float)`,
                        animationDelay: `${i * 1.6}s`,
                      }}
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 28vw, 60vw"
                        className="object-cover"
                      />
                    </div>
                  );
                })}
              </Tilt>
            </Reveal>
          ) : null}
        </div>
      </section>

      {featured.length ? (
        <section className="py-14 md:py-20">
          <div className="container-page">
            <Reveal>
              <SectionHeading
                eyebrow={t("nav.catalog")}
                title={t("home.featuredTitle")}
                href="/catalog"
                linkLabel={t("common.viewAll")}
              />
            </Reveal>
            <Reveal delay={90}>
              <ProductGrid
                products={featured}
                locale={locale}
                currency={settings.currency}
                variant="rail"
              />
            </Reveal>
          </div>
        </section>
      ) : null}

      {posts.length ? (
        <section className="border-t border-ink-100 py-14 md:py-20">
          <div className="container-page">
            <Reveal>
              <SectionHeading
                eyebrow={t("blog.title")}
                title={t("home.blogTitle")}
                href="/blog"
                linkLabel={t("common.viewAll")}
              />
            </Reveal>

            <div className="grid gap-5 md:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={i * 80}>
                  <article className="group h-full">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink-100">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 33vw, 100vw"
                            className="object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <time
                        dateTime={post.publishedAt.toISOString()}
                        className="mt-4 block text-xs font-semibold uppercase tracking-wider text-ink-400"
                      >
                        {formatDate(post.publishedAt, locale)}
                      </time>
                      <h3 className="clamp-2 mt-2 text-lg font-bold leading-snug transition group-hover:text-brand-600">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="clamp-3 mt-2 text-sm leading-relaxed text-ink-500">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-ink-100 bg-ink-50/60 py-14 md:py-20">
        <div className="container-page max-w-4xl">
          <Reveal>
            <h2 className="text-2xl font-extrabold md:text-3xl">{t("home.seoTitle")}</h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-600 md:text-[15px]">
              {t("home.seoText")}
            </p>
            <ButtonLink href="/catalog" variant="primary" size="lg" className="mt-8 group">
              {t("home.shopNow")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd(locale)) }}
      />
    </>
  );
}
