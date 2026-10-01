import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Facebook, Instagram, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { SiteSettings } from "@/lib/settings";
import { getCategoryTree } from "@/lib/queries/catalog";
import { db } from "@/lib/db";

async function getFooterPages(locale: Locale) {
  try {
    return await db.pageTranslation.findMany({
      where: { locale, page: { isActive: true } },
      orderBy: { page: { sortOrder: "asc" } },
      select: { title: true, slug: true },
    });
  } catch {
    return [];
  }
}

export async function SiteFooter({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettings;
}) {
  const [t, categories, pages] = await Promise.all([
    getTranslations(),
    getCategoryTree(locale),
    getFooterPages(locale),
  ]);

  const socials = [
    { href: settings.telegram, Icon: Send, label: "Telegram" },
    { href: settings.instagram, Icon: Instagram, label: "Instagram" },
    { href: settings.facebook, Icon: Facebook, label: "Facebook" },
    { href: settings.youtube, Icon: Youtube, label: "YouTube" },
  ].filter((s): s is { href: string; Icon: typeof Send; label: string } => Boolean(s.href));

  return (
    <footer className="mt-16 border-t border-ink-100 bg-ink-50/70">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div>
          <Image
            src="/media/site/logo.png"
            alt="United Sport"
            width={299}
            height={63}
            className="h-8 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">
            {t("common.tagline")}
          </p>
          {socials.length ? (
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition hover:border-brand-600 hover:text-brand-600"
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <nav aria-label={t("footer.catalogue")}>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ink-900">
            {t("footer.catalogue")}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/catalog/${category.slug}`}
                  className="text-sm text-ink-600 transition hover:text-brand-600"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/brands" className="text-sm text-ink-600 transition hover:text-brand-600">
                {t("nav.brands")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t("footer.info")}>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ink-900">
            {t("footer.info")}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {pages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/info/${page.slug}`}
                  className="text-sm text-ink-600 transition hover:text-brand-600"
                >
                  {page.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/blog" className="text-sm text-ink-600 transition hover:text-brand-600">
                {t("nav.blog")}
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="text-sm text-ink-600 transition hover:text-brand-600">
                {t("nav.contacts")}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ink-900">
            {t("footer.contacts")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-600">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              <span>{settings.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              <a
                href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
                className="transition hover:text-brand-600"
              >
                {settings.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              <a href={`mailto:${settings.email}`} className="transition hover:text-brand-600">
                {settings.email}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-ink-500">{settings.workingHours}</p>
        </div>
      </div>

      <div className="border-t border-ink-200/70">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} United Sport. {t("footer.rights")}.
          </p>
          <p aria-hidden className="tracking-wide">
            {locale.toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  );
}
