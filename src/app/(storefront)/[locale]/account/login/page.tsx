import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCurrentCustomer } from "@/lib/auth";
import { AuthForm } from "@/components/account/AuthForm";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("account.login"), robots: { index: false, follow: true } };
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await getCurrentCustomer()) redirect(`/${locale}/account`);

  const t = await getTranslations();

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold">{t("account.login")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("common.tagline")}</p>

        <div className="mt-6">
          <AuthForm
            mode="login"
            locale={locale}
            labels={{
              email: t("common.email"),
              password: t("account.password"),
              firstName: t("checkout.firstName"),
              lastName: t("checkout.lastName"),
              phone: t("common.phone"),
              submit: t("account.login"),
              sending: t("common.sending"),
              credentials: t("account.invalidCredentials"),
              taken: t("account.emailTaken"),
              short: t("account.passwordTooShort"),
              invalid: t("common.required"),
              error: t("common.somethingWrong"),
            }}
          />
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          {t("account.noAccount")}{" "}
          <Link href="/account/register" className="font-semibold text-brand-600 hover:underline">
            {t("account.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
