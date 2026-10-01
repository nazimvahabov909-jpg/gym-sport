"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { endAdminSession, startAdminSession, verifyPassword } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(191),
  password: z.string().min(1).max(200),
});

export type AdminLoginResult = { ok: true } | { ok: false; error: "credentials" | "failed" };

export async function adminLogin(input: z.input<typeof schema>): Promise<AdminLoginResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "credentials" };

  try {
    const admin = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
    // Constant-ish work regardless of whether the account exists.
    const hash = admin?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi";
    const valid = await verifyPassword(parsed.data.password, hash);
    if (!admin || !admin.isActive || !valid) return { ok: false, error: "credentials" };

    await db.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await startAdminSession(admin.id);
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function adminLogout() {
  await endAdminSession();
}
