import { Suspense } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Heart, Mail, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { SiteSettings } from "@/lib/settings";
import { getCategoryTree } from "@/lib/queries/catalog";
import { CartButton, AccountButton } from "./HeaderActions";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { SearchForm } from "./SearchForm";

export async function SiteHeader({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettings;
}) {
  // Nothing here touches cookies: the header must stay cacheable so the pages
  // that embed it can be statically rendered. Visitor state arrives from
  // <SessionProvider> on the client.
  const [t, categories] = await Promise.all([getTranslations(), getCategoryTree(locale)]);

  const telHref = `tel:${settings.phone.replace(/[^+\d]/g, "")}`;

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      {/* Utility strip — desktop only, it is noise on a phone. */}
      <div className="hidden bg-ink-900 text-ink-100 lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="text-ink-300">{t("common.tagline")}</p>
          <div className="flex items-center gap-5">
            <a href={telHref} className="flex items-center gap-1.5 transition hover:text-white">
              <Phone className="size-3.5" aria-hidden />
              {settings.phone}
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <Mail className="size-3.5" aria-hidden />
              {settings.email}
            </a>
          </div>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-2 md:h-20 md:gap-4">
        <MobileMenu
          categories={categories}
          phone={settings.phone}
          labels={{
            menu: t("common.menu"),
            close: t("common.close"),
            search: t("common.search"),
            searchPlaceholder: t("common.searchPlaceholder"),
            catalog: t("nav.catalog"),
            brands: t("nav.brands"),
            blog: t("nav.blog"),
            about: t("nav.about"),
            contacts: t("nav.contacts"),
            account: t("nav.account"),
          }}
        />

        <Link href="/" className="shrink-0" aria-label={t("common.siteName")}>
          <Image
            src="/media/site/logo.png"
            alt="United Sport"
            width={299}
            height={63}
            priority
            className="h-7 w-auto md:h-9"
          />
        </Link>

        <div className="ml-auto hidden max-w-lg flex-1 lg:ml-8 lg:block">
          <SearchForm
            label={t("common.search")}
            placeholder={t("common.searchPlaceholder")}
          />
        </div>

        <div className="ml-auto flex items-center gap-0.5 lg:ml-4 lg:gap-1">
          <div className="hidden lg:block">
            {/* Suspense because the switcher reads the query string, which would
                otherwise opt every catalogue page out of static rendering. */}
            <Suspense fallback={<div className="size-9" />}>
              <LocaleSwitcher current={locale} />
            </Suspense>
          </div>

          <Link
            href="/account/wishlist"
            aria-label={t("nav.wishlist")}
            className="hidden size-10 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100 hover:text-ink-900 sm:grid"
          >
            <Heart className="size-5" aria-hidden />
          </Link>

          <AccountButton
            labels={{ account: t("account.title"), signIn: t("account.login") }}
          />

          <CartButton label={t("nav.cart")} />

          <div className="lg:hidden">
            <Suspense fallback={<div className="size-9" />}>
              <LocaleSwitcher current={locale} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Primary categories — desktop navigation bar with hover panels. */}
      <nav aria-label={t("nav.catalog")} className="hidden border-t border-ink-100 lg:block">
        <div className="container-page">
          <ul className="flex items-stretch gap-1">
            {categories.map((category) => (
              <li key={category.id} className="group relative">
                <Link
                  href={`/catalog/${category.slug}`}
                  className="flex h-12 items-center px-4 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ink-800 transition group-hover:text-brand-600"
                >
                  {category.name}
                </Link>
                {category.children.length ? (
                  <div className="invisible absolute left-0 top-full z-40 w-64 translate-y-1 rounded-b-xl border border-t-0 border-ink-100 bg-white p-2 opacity-0 shadow-pop transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <ul>
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/catalog/${child.slug}`}
                            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-ink-700 transition hover:bg-ink-50 hover:text-brand-600"
                          >
                            {child.name}
                            <span className="text-xs text-ink-400">{child.productCount}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
            <li className="ml-auto flex items-center gap-1">
              {[
                { href: "/brands", label: t("nav.brands") },
                { href: "/blog", label: t("nav.blog") },
                { href: "/contacts", label: t("nav.contacts") },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-12 items-center px-3 text-[13px] font-semibold text-ink-500 transition hover:text-ink-900"
                >
                  {item.label}
                </Link>
              ))}
            </li>
          </ul>
        </div>
      </nav>

      {/* Phone-width search lives under the bar so the logo keeps its room. */}
      <div className="container-page pb-3 lg:hidden">
        <SearchForm label={t("common.search")} placeholder={t("common.searchPlaceholder")} />
      </div>
    </header>
  );
}
