import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-extrabold">{t("errors.notFoundTitle")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">{t("errors.notFoundText")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/" size="lg">
            {t("errors.goHome")}
          </ButtonLink>
          <ButtonLink href="/catalog" variant="outline" size="lg">
            {t("catalog.title")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
