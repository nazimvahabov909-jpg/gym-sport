import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { ButtonLink } from "@/components/ui/Button";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("checkout.successTitle"), robots: { index: false, follow: false } };
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const [{ locale }, { order }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <CheckCircle2 className="mx-auto size-16 text-brand-600" aria-hidden />
        <h1 className="mt-6 text-2xl font-extrabold md:text-3xl">{t("checkout.successTitle")}</h1>
        {order ? (
          <p className="mt-3 text-sm text-ink-500">
            {t("checkout.orderNumber")}:{" "}
            <span className="font-bold text-ink-900">{order}</span>
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-ink-600">{t("checkout.successText")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/catalog" size="lg">
            {t("cart.continue")}
          </ButtonLink>
          <ButtonLink href="/account/orders" variant="outline" size="lg">
            {t("account.orders")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
