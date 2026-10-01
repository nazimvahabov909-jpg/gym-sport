import "server-only";
import { getCurrentAdmin } from "@/lib/auth";

/** Every admin mutation must go through this — actions are public endpoints. */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function isAdmin() {
  return (await getCurrentAdmin()) !== null;
}
