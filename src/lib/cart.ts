import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";
import type { Locale } from "@/i18n/routing";
import { toNumber } from "@/lib/format";

const CART_COOKIE = "us_cart";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days
export const MAX_QTY_PER_LINE = 99;

export type CartLine = {
  productId: number;
  quantity: number;
  name: string;
  slug: string;
  sku: string | null;
  image: string | null;
  price: number;
  priceOnRequest: boolean;
  lineTotal: number;
};

export type CartView = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  /** True when at least one line has no published price. */
  needsQuote: boolean;
};

export const EMPTY_CART: CartView = { lines: [], itemCount: 0, subtotal: 0, needsQuote: false };

/** Reads the cart cookie without creating one — safe inside Server Components. */
async function readCartToken() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

/**
 * Returns the cart row, creating it (and its cookie) on demand. Only call from
 * a Server Action or Route Handler — Server Components may not set cookies.
 */
export async function getOrCreateCart() {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  const customer = await getCurrentCustomer();

  if (existing) {
    const cart = await db.cart.findUnique({ where: { token: existing } });
    if (cart) {
      // Claim an anonymous cart once the visitor signs in.
      if (customer && cart.customerId !== customer.id) {
        return db.cart.update({ where: { id: cart.id }, data: { customerId: customer.id } });
      }
      return cart;
    }
  }

  const token = randomBytes(24).toString("hex");
  const cart = await db.cart.create({ data: { token, customerId: customer?.id ?? null } });
  jar.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return cart;
}

export async function clearCartCookie() {
  (await cookies()).delete(CART_COOKIE);
}

/** Empties the current visitor's cart and forgets the cookie. */
export async function emptyCurrentCart() {
  const token = await readCartToken();
  if (token) {
    const cart = await db.cart.findUnique({ where: { token }, select: { id: true } });
    if (cart) await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  await clearCartCookie();
}

/** Per-request cached so the header badge and the page body share one query. */
export const getCart = cache(async (locale: Locale): Promise<CartView> => {
  const token = await readCartToken();
  if (!token) return EMPTY_CART;

  const cart = await db.cart.findUnique({
    where: { token },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: {
          product: {
            include: {
              translations: { where: { locale } },
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) return EMPTY_CART;

  const lines: CartLine[] = cart.items
    .filter((item) => item.product.isActive)
    .map((item) => {
      const t = item.product.translations[0];
      const price = toNumber(item.product.price);
      const priceOnRequest = item.product.priceOnRequest || price <= 0;
      return {
        productId: item.productId,
        quantity: item.quantity,
        name: t?.name ?? `#${item.productId}`,
        slug: t?.slug ?? String(item.productId),
        sku: item.product.sku,
        image: item.product.images[0]?.url ?? null,
        price,
        priceOnRequest,
        lineTotal: priceOnRequest ? 0 : price * item.quantity,
      };
    });

  return {
    lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal: lines.reduce((sum, l) => sum + l.lineTotal, 0),
    needsQuote: lines.some((l) => l.priceOnRequest),
  };
});

/** Cheap count for the header badge — avoids loading translations and images. */
export const getCartCount = cache(async (): Promise<number> => {
  const token = await readCartToken();
  if (!token) return 0;
  const result = await db.cartItem.aggregate({
    where: { cart: { token }, product: { isActive: true } },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
});

export function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_QTY_PER_LINE, Math.max(1, Math.trunc(value)));
}
