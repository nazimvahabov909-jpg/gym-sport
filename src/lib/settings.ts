import { cache } from "react";
import { db } from "@/lib/db";

export type SiteSettings = {
  phone: string;
  phoneSecondary: string | null;
  email: string;
  address: string;
  workingHours: string;
  currency: string;
  telegram: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: "+998 98 128 01 28",
  phoneSecondary: null,
  email: "info@unitedsport.az",
  address: "Toshkent, O‘zbekiston",
  workingHours: "09:00 – 18:00",
  currency: "UZS",
  telegram: null,
  instagram: null,
  facebook: null,
  youtube: null,
};

/**
 * Cached per request: the header, the footer and the product page all need
 * settings, and none of them should trigger its own query.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await db.setting.findUnique({ where: { key: "site" } });
    if (!row) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(row.value as Partial<SiteSettings>) };
  } catch {
    // The storefront must still render if the DB is briefly unreachable.
    return DEFAULT_SETTINGS;
  }
});
