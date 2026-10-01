"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { locales } from "@/i18n/routing";
import {
  endCustomerSession,
  hashPassword,
  startCustomerSession,
  verifyPassword,
} from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";

export type AuthResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "credentials" | "taken" | "short" | "failed" };

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(191),
  password: z.string().min(1).max(200),
});

const registerSchema = loginSchema.extend({
  firstName: z.string().trim().min(2).max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  password: z.string().min(8, "short").max(200),
  locale: z.enum(locales).default("ru"),
});

export async function login(input: z.input<typeof loginSchema>): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    const customer = await db.customer.findUnique({ where: { email: parsed.data.email } });
    // Always run a comparison so a missing account and a wrong password take
    // the same time and cannot be told apart.
    const hash = customer?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi";
    const valid = await verifyPassword(parsed.data.password, hash);
    if (!customer || !customer.isActive || !valid) return { ok: false, error: "credentials" };

    await startCustomerSession(customer.id);
    // Carries an anonymous cart over into the signed-in session.
    await getOrCreateCart();
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function register(input: z.input<typeof registerSchema>): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const short = parsed.error.issues.some((i) => i.path[0] === "password");
    return { ok: false, error: short ? "short" : "invalid" };
  }
  const data = parsed.data;

  try {
    const existing = await db.customer.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) return { ok: false, error: "taken" };

    const customer = await db.customer.create({
      data: {
        email: data.email,
        passwordHash: await hashPassword(data.password),
        firstName: data.firstName,
        lastName: data.lastName || null,
        phone: data.phone || null,
        locale: data.locale,
      },
      select: { id: true },
    });

    await startCustomerSession(customer.id);
    await getOrCreateCart();
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function logout() {
  await endCustomerSession();
}
