"use server";

import { db } from "@/lib/db";
import { clampQuantity, getOrCreateCart } from "@/lib/cart";

export type CartActionResult = { ok: true; itemCount: number } | { ok: false; error: string };

async function countItems(cartId: number) {
  const result = await db.cartItem.aggregate({
    where: { cartId, product: { isActive: true } },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export async function addToCart(productId: number, quantity = 1): Promise<CartActionResult> {
  const qty = clampQuantity(quantity);
  try {
    const product = await db.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) return { ok: false, error: "not_found" };

    const cart = await getOrCreateCart();
    const existing = await db.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { quantity: true },
    });

    await db.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity: qty },
      update: { quantity: clampQuantity((existing?.quantity ?? 0) + qty) },
    });

    return { ok: true, itemCount: await countItems(cart.id) };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function setCartQuantity(productId: number, quantity: number): Promise<CartActionResult> {
  try {
    const cart = await getOrCreateCart();
    if (quantity <= 0) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    } else {
      await db.cartItem.updateMany({
        where: { cartId: cart.id, productId },
        data: { quantity: clampQuantity(quantity) },
      });
    }
    return { ok: true, itemCount: await countItems(cart.id) };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function removeFromCart(productId: number): Promise<CartActionResult> {
  return setCartQuantity(productId, 0);
}
