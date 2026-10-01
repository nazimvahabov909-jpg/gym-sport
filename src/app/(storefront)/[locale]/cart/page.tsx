import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Info, ShoppingBag } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getCart } from "@/lib/cart";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/format";
import { alternatesFor, samePath } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { CartLines } from "@/components/cart/CartLines";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("cart.title"),
    robots: { index: false, follow: true },
    alternates: alternatesFor(locale, samePath("/cart")),
  };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, cart, settings] = await Promise.all([getTranslations(), getCart(locale), getSettings()]);
  const money = (value: number) => formatMoney(value, locale, settings.currency);

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("cart.title") }]} />
      <h1 className="mb-6 text-2xl font-extrabold md:text-4xl">{t("cart.title")}</h1>

      {cart.lines.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-200 px-6 py-16 text-center">
          <ShoppingBag className="mx-auto size-10 text-ink-300" aria-hidden />
          <h2 className="mt-4 text-lg font-bold">{t("cart.empty")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">{t("cart.emptyText")}</p>
          <ButtonLink href="/catalog" size="lg" className="mt-6">
            {t("cart.continue")}
          </ButtonLink>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <div>
            <CartLines
              lines={cart.lines}
              locale={locale}
              currency={settings.currency}
              labels={{
                quantity: t("product.quantity"),
                remove: t("common.remove"),
                priceOnRequest: t("product.priceOnRequest"),
                sku: t("product.sku"),
              }}
            />
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-card border border-ink-100 bg-ink-50/60 p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink-500">
                {t("checkout.summary")}
              </h2>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-600">{t("cart.subtotal")}</dt>
                  <dd className="font-semibold">{money(cart.subtotal)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-baseline justify-between border-t border-ink-200 pt-4">
                <span className="font-bold">{t("cart.total")}</span>
                <span className="text-xl font-extrabold">{money(cart.subtotal)}</span>
              </div>

              {cart.needsQuote ? (
                <p className="mt-4 flex gap-2 rounded-lg bg-white p-3 text-xs leading-relaxed text-ink-600">
                  <Info className="mt-0.5 size-4 shrink-0 text-navy-800" aria-hidden />
                  {t("cart.quoteNotice")}
                </p>
              ) : null}

              <ButtonLink href="/checkout" size="lg" className="mt-5 w-full">
                {t("cart.checkout")}
              </ButtonLink>
              <ButtonLink href="/catalog" variant="ghost" size="md" className="mt-2 w-full">
                {t("cart.continue")}
              </ButtonLink>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
