"use client";

import { useState, type ReactNode } from "react";
import { locales, type Locale } from "@/i18n/routing";
import { LOCALE_LABELS } from "@/lib/admin/labels";

/**
 * Tabs across the four languages. Every tab stays mounted so unsaved text in a
 * hidden language is never lost — only the active one is visible.
 */
export function LocaleTabs({
  render,
  incomplete,
}: {
  render: (locale: Locale) => ReactNode;
  /** Locales still missing a required field, flagged with a dot. */
  incomplete?: Locale[];
}) {
  const [active, setActive] = useState<Locale>("ru");

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-ink-200">
        {locales.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActive(locale)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              active === locale
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            {LOCALE_LABELS[locale]}
            {incomplete?.includes(locale) ? (
              <span className="size-1.5 rounded-full bg-brand-600" aria-label="не заполнено" />
            ) : null}
          </button>
        ))}
      </div>

      {locales.map((locale) => (
        <div key={locale} className={active === locale ? "pt-5" : "hidden"}>
          {render(locale)}
        </div>
      ))}
    </div>
  );
}
