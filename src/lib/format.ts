import type { Locale } from "@/i18n/routing";

/** Prisma returns Decimal columns as objects; everything here wants a number. */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

const INTL_LOCALE: Record<Locale, string> = {
  ru: "ru-UZ",
  uz: "uz-UZ",
  en: "en-US",
  az: "az-AZ",
};

export function formatMoney(value: unknown, locale: Locale, currency = "UZS") {
  const amount = toNumber(value);
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    // Unknown currency code from settings — fall back to a plain grouped number.
    return `${new Intl.NumberFormat(INTL_LOCALE[locale]).format(amount)} ${currency}`;
  }
}

export function formatDate(value: Date | string, locale: Locale) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: Date | string, locale: Locale = "ru") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Loose phone check — Uzbek and Azerbaijani numbers, with or without +. */
export function isValidPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}
