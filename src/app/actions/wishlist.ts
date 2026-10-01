"use server";

import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

export type WishlistResult =
  | { ok: true; inWishlist: boolean }
  | { ok: false; error: "auth" | "failed" };

export async function toggleWishlist(productId: number): Promise<WishlistResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, error: "auth" };

  try {
    const existing = await db.wishlistItem.findUnique({
      where: { customerId_productId: { customerId: customer.id, productId } },
      select: { id: true },
    });

    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      return { ok: true, inWishlist: false };
    }

    await db.wishlistItem.create({ data: { customerId: customer.id, productId } });
    return { ok: true, inWishlist: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}
