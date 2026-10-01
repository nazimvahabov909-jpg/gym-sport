import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Info } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getCart } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("checkout.title"), robots: { index: false, follow: false } };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, cart, customer, settings] = await Promise.all([
    getTranslations(),
    getCart(locale),
    getCurrentCustomer(),
    getSettings(),
  ]);

  if (cart.lines.length === 0) redirect(`/${locale}/cart`);

  const money = (value: number) => formatMoney(value, locale, settings.currency);

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("cart.title"), href: "/cart" }, { name: t("checkout.title") }]} />
      <h1 className="mb-6 text-2xl font-extrabold md:text-4xl">{t("checkout.title")}</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <CheckoutForm
          locale={locale}
          defaults={{
            firstName: customer?.firstName,
            lastName: customer?.lastName ?? undefined,
            phone: customer?.phone ?? undefined,
            email: customer?.email,
          }}
          labels={{
            contact: t("checkout.contact"),
            firstName: t("checkout.firstName"),
            lastName: t("checkout.lastName"),
            phone: t("common.phone"),
            email: t("common.email"),
            city: t("checkout.city"),
            addressLine: t("checkout.addressLine"),
            comment: t("checkout.comment"),
            payment: t("checkout.payment"),
            paymentCash: t("checkout.paymentCash"),
            paymentTransfer: t("checkout.paymentTransfer"),
            paymentCard: t("checkout.paymentCard"),
            placeOrder: t("checkout.placeOrder"),
            sending: t("common.sending"),
            invalid: t("common.required"),
            empty: t("cart.empty"),
            error: t("common.somethingWrong"),
          }}
        />

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-card border border-ink-100 bg-ink-50/60 p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink-500">
              {t("checkout.summary")}
            </h2>

            <ul className="mt-4 space-y-3">
              {cart.lines.map((line) => (
                <li key={line.productId} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-white">
                    {line.image ? (
                      <Image src={line.image} alt="" fill sizes="56px" className="object-contain p-1" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="clamp-2 text-xs font-semibold leading-snug">{line.name}</p>
                    <p className="mt-0.5 text-xs text-ink-500">× {line.quantity}</p>
                  </div>
                  <p className="text-xs font-bold">
                    {line.priceOnRequest ? "—" : money(line.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-baseline justify-between border-t border-ink-200 pt-4">
              <span className="font-bold">{t("cart.total")}</span>
              <span className="text-xl font-extrabold">{money(cart.subtotal)}</span>
            </div>

            {cart.needsQuote ? (
              <p className="mt-4 flex gap-2 rounded-lg bg-white p-3 text-xs leading-relaxed text-ink-600">
                <Info className="mt-0.5 size-4 shrink-0 text-navy-800" aria-hidden />
                {t("cart.quoteNotice")}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
