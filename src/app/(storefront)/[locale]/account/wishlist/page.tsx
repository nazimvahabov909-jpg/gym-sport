import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Heart } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { toNumber } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { ProductGrid } from "@/components/catalog/ProductCard";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("nav.wishlist"), robots: { index: false, follow: false } };
}

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/${locale}/account/login`);

  const [t, settings, items] = await Promise.all([
    getTranslations(),
    getSettings(),
    db.wishlistItem.findMany({
      where: { customerId: customer.id, product: { isActive: true } },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            brand: { select: { name: true } },
            translations: { where: { locale } },
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    }),
  ]);

  const products = items.map(({ product }) => {
    const name = product.translations[0]?.name ?? `#${product.id}`;
    const price = toNumber(product.price);
    return {
      id: product.id,
      slug: product.translations[0]?.slug ?? String(product.id),
      name,
      sku: product.sku,
      brand: product.brand?.name ?? null,
      image: product.images[0]?.url ?? null,
      imageAlt: product.images[0]?.alt ?? name,
      price,
      oldPrice: product.oldPrice ? toNumber(product.oldPrice) : null,
      priceOnRequest: product.priceOnRequest || price <= 0,
      inStock: product.stockStatus === "IN_STOCK",
      isNew: product.isNew,
    };
  });

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("account.title"), href: "/account" }, { name: t("nav.wishlist") }]} />
      <h1 className="mb-6 text-2xl font-extrabold md:text-4xl">{t("nav.wishlist")}</h1>

      {products.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-200 px-6 py-16 text-center">
          <Heart className="mx-auto size-10 text-ink-300" aria-hidden />
          <p className="mt-4 text-sm text-ink-500">{t("catalog.nothingFound")}</p>
          <ButtonLink href="/catalog" size="lg" className="mt-6">
            {t("cart.continue")}
          </ButtonLink>
        </div>
      ) : (
        <ProductGrid products={products} locale={locale} currency={settings.currency} />
      )}
    </div>
  );
}
