"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { locales } from "@/i18n/routing";
import { isValidPhone } from "@/lib/format";

const schema = z.object({
  type: z.enum(["CALLBACK", "PRICE_REQUEST", "CONTACT"]).default("CALLBACK"),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40).refine(isValidPhone),
  email: z.string().trim().email().max(191).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  productId: z.number().int().positive().optional(),
  locale: z.enum(locales).default("ru"),
  /** Honeypot — real people never fill a hidden field. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type LeadInput = z.input<typeof schema>;
export type LeadResult = { ok: true } | { ok: false; error: "invalid" | "failed" };

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { website, ...data } = parsed.data;
  if (website) return { ok: true }; // silently drop bots

  try {
    await db.lead.create({
      data: {
        type: data.type,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        message: data.message || null,
        productId: data.productId ?? null,
        locale: data.locale,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}
