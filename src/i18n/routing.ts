import { defineRouting } from "next-intl/routing";

export const locales = ["ru", "uz", "en", "az"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  ru: "Русский",
  uz: "O‘zbekcha",
  en: "English",
  az: "Azərbaycan",
};

/** Used for <html lang> and hreflang — the region makes the signal specific. */
export const htmlLang: Record<Locale, string> = {
  ru: "ru-UZ",
  uz: "uz-UZ",
  en: "en",
  az: "az-AZ",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "ru",
  // Every locale carries its own prefix so each one is a distinct, indexable
  // URL — no duplicate content between "/" and "/ru".
  localePrefix: "always",
});
