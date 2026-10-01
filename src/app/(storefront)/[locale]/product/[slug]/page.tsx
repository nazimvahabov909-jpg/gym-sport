import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, PackageCheck, PackageX, Truck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { staticParamsSafe } from "@/lib/safe-query";
import { getSettings } from "@/lib/settings";
import { formatMoney, toNumber } from "@/lib/format";
import {
  getCategoryPath,
  getProductBySlug,
  getProductSlugsByLocale,
  getRelatedProducts,
} from "@/lib/queries/catalog";
import {
  absolute,
  alternatesFor,
  breadcrumbJsonLd,
  jsonLdScript,
  openGraph,
  productJsonLd,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/Section";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductGrid } from "@/components/catalog/ProductCard";
import { BuyBox } from "@/components/catalog/BuyBox";
import { WishlistButton } from "@/components/catalog/WishlistButton";
import { LeadDialog } from "@/components/catalog/LeadDialog";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  return staticParamsSafe(async () => {
    // Pre-render the most visited slice; the rest renders on demand.
    const rows = await db.productTranslation.findMany({
      where: { product: { isActive: true } },
      select: { locale: true, slug: true },
      take: 400,
    });
    return rows.filter((r) => (locales as readonly string[]).includes(r.locale));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const translation = await getProductBySlug(locale, slug);
  if (!translation) return {};

  const slugs = await getProductSlugsByLocale(translation.productId);
  const images = translation.product.images.map((i) => i.url);

  return {
    title: translation.name,
    description:
      translation.metaDescription ??
      translation.shortDescription ??
      `${translation.name}${translation.product.sku ? ` — ${translation.product.sku}` : ""}`,
    alternates: alternatesFor(locale, (l) => (slugs[l] ? `/product/${slugs[l]}` : null)),
    openGraph: openGraph({
      title: translation.name,
      description: translation.metaDescription,
      locale,
      path: `/product/${slug}`,
      images: images.length ? images.slice(0, 3) : undefined,
    }),
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const translation = await getProductBySlug(locale, slug);
  if (!translation) notFound();

  const product = translation.product;
  const categoryIds = product.categories.map((c) => c.categoryId);

  const [t, settings, path, related] = await Promise.all([
    getTranslations(),
    getSettings(),
    categoryIds.length ? getCategoryPath(locale, categoryIds[0]) : Promise.resolve([]),
    getRelatedProducts(locale, product.id, categoryIds, 8),
  ]);

  const price = toNumber(product.price);
  const priceOnRequest = product.priceOnRequest || price <= 0;
  const inStock = product.stockStatus === "IN_STOCK";
  const url = absolute(`/${locale}/product/${slug}`);

  const stockLabel = {
    IN_STOCK: t("product.inStock"),
    OUT_OF_STOCK: t("product.outOfStock"),
    PRE_ORDER: t("product.preOrder"),
    ON_ORDER: t("product.onOrder"),
  }[product.stockStatus];

  return (
    <div className="container-page pb-16">
      <Breadcrumbs
        items={[
          { name: t("catalog.title"), href: "/catalog" },
          ...path.map((step) => ({ name: step.name, href: `/catalog/${step.slug}` })),
          { name: translation.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images.map((i) => ({ url: i.url, alt: i.alt }))}
          name={translation.name}
          label={t("product.gallery")}
        />

        <div>
          {product.brand ? (
            <Link
              href={`/brands/${product.brand.slug}`}
              className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600"
            >
              {product.brand.name}
            </Link>
          ) : null}

          <h1 className="mt-2 text-2xl font-extrabold leading-tight md:text-4xl">
            {translation.name}
          </h1>

          <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {product.sku ? (
              <div className="flex gap-2">
                <dt className="text-ink-500">{t("product.sku")}:</dt>
                <dd className="font-semibold text-ink-900">{product.sku}</dd>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <dt className="sr-only">{t("product.availability")}</dt>
              <dd
                className={`flex items-center gap-1.5 font-semibold ${
                  inStock ? "text-emerald-600" : "text-ink-500"
                }`}
              >
                {inStock ? (
                  <PackageCheck className="size-4" aria-hidden />
                ) : (
                  <PackageX className="size-4" aria-hidden />
                )}
                {stockLabel}
              </dd>
            </div>
          </dl>

          {translation.shortDescription ? (
            <p className="mt-5 text-sm leading-relaxed text-ink-600">
              {translation.shortDescription}
            </p>
          ) : null}

          <div className="mt-6 rounded-card border border-ink-100 bg-ink-50/50 p-5">
            {priceOnRequest ? (
              <p className="text-xl font-extrabold text-navy-800 md:text-2xl">
                {t("product.priceOnRequest")}
              </p>
            ) : (
              <p className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-extrabold md:text-4xl">
                  {formatMoney(price, locale, settings.currency)}
                </span>
                {product.oldPrice && toNumber(product.oldPrice) > price ? (
                  <span className="text-base text-ink-400 line-through">
                    {formatMoney(product.oldPrice, locale, settings.currency)}
                  </span>
                ) : null}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3">
              <BuyBox
                productId={product.id}
                labels={{
                  quantity: t("product.quantity"),
                  add: t("product.addToCart"),
                  added: t("product.inCart"),
                  error: t("common.somethingWrong"),
                }}
              />

              <div className="flex gap-3">
                <WishlistButton
                  productId={product.id}
                  labels={{ add: t("nav.wishlist"), signIn: t("account.login") }}
                />
                <LeadDialog
                locale={locale}
                productId={product.id}
                productName={translation.name}
                variant="outline"
                size="lg"
                className="flex-1"
                labels={{
                  trigger: priceOnRequest ? t("product.requestPrice") : t("lead.callback"),
                  title: t("lead.title"),
                  text: t("lead.text"),
                  name: t("lead.name"),
                  phone: t("common.phone"),
                  message: t("lead.message"),
                  send: t("common.send"),
                  sending: t("common.sending"),
                  sent: t("lead.sent"),
                  sentText: t("lead.sentText"),
                  close: t("common.close"),
                  required: t("common.required"),
                  error: t("common.somethingWrong"),
                }}
              />
              </div>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { Icon: Truck, text: t("home.benefits.delivery.title") },
              { Icon: BadgeCheck, text: t("home.benefits.warranty.title") },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-ink-600">
                <Icon className="size-4 shrink-0 text-brand-600" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-extrabold md:text-2xl">{t("product.description")}</h2>
          {translation.description ? (
            <div
              className="prose-cms mt-4"
              dangerouslySetInnerHTML={{ __html: translation.description }}
            />
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-ink-500">{t("product.noDescription")}</p>
          )}
        </div>

        {product.specs.length ? (
          <div>
            <h2 className="text-xl font-extrabold md:text-2xl">{t("product.specs")}</h2>
            <dl className="mt-4 divide-y divide-ink-100 border-y border-ink-100">
              {product.specs.map((spec) => (
                <div key={spec.id} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-ink-500">{spec.name}</dt>
                  <dd className="text-right font-semibold text-ink-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>

      {related.length ? (
        <section className="mt-14 lg:mt-20">
          <SectionHeading title={t("product.related")} />
          <ProductGrid products={related} locale={locale} currency={settings.currency} />
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            productJsonLd({
              name: translation.name,
              description: translation.metaDescription ?? translation.shortDescription,
              sku: product.sku,
              brand: product.brand?.name ?? null,
              images: product.images.map((i) => i.url),
              url,
              price,
              priceOnRequest,
              inStock,
              currency: settings.currency,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: t("nav.home"), url: absolute(`/${locale}`) },
              { name: t("catalog.title"), url: absolute(`/${locale}/catalog`) },
              ...path.map((step) => ({ name: step.name, url: absolute(`/${locale}/catalog/${step.slug}`) })),
              { name: translation.name, url },
            ]),
          ),
        }}
      />
    </div>
  );
}
