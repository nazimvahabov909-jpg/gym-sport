"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { localeLabels, locales, type Locale } from "@/i18n/routing";

const SHORT: Record<Locale, string> = { ru: "RU", uz: "UZ", en: "EN", az: "AZ" };

/**
 * Slugs differ per language, so each option links to /api/locale, which looks
 * up the matching translation server-side and redirects. Plain anchors mean the
 * switcher keeps working without JavaScript and can be opened in a new tab.
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [open, setOpen] = useState(false);

  const hrefFor = (locale: Locale) => {
    const params = new URLSearchParams(search);
    params.set("to", locale);
    params.set("path", pathname);
    return `/api/locale?${params.toString()}`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={localeLabels[current]}
        className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
      >
        <Globe className="size-4" aria-hidden />
        {SHORT[current]}
        <ChevronDown className={`size-3.5 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open ? (
        <ul
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-44 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-pop"
        >
          {locales.map((locale) => (
            <li key={locale} role="none">
              <a
                role="menuitem"
                href={hrefFor(locale)}
                aria-current={locale === current ? "true" : undefined}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition hover:bg-ink-50 ${
                  locale === current ? "font-semibold text-brand-600" : "text-ink-700"
                }`}
              >
                {localeLabels[locale]}
                {locale === current ? <Check className="size-4" aria-hidden /> : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
