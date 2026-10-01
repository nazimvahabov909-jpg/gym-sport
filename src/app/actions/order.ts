"use server";

import { randomInt } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { locales } from "@/i18n/routing";
import { emptyCurrentCart, getCart } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/auth";
import { isValidPhone, toNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";

const schema = z.object({
  firstName: z.string().trim().min(2).max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().min(6).max(40).refine(isValidPhone),
  email: z.string().trim().email().max(191).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  addressLine: z.string().trim().max(500).optional().or(z.literal("")),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CARD_ON_DELIVERY"]),
  locale: z.enum(locales),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type PlaceOrderInput = z.input<typeof schema>;
export type PlaceOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: "invalid" | "empty" | "failed" };

/** US-260922-4817 — short enough to read over the phone, unique in practice. */
function buildOrderNumber() {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  return `US-${stamp}-${String(randomInt(1000, 9999))}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;
  if (data.website) return { ok: false, error: "invalid" };

  const cart = await getCart(data.locale);
  if (cart.lines.length === 0) return { ok: false, error: "empty" };

  try {
    const [customer, settings] = await Promise.all([getCurrentCustomer(), getSettings()]);

    // Re-read prices from the database: the cart view is rendered client-side
    // and must never be trusted as the source of the amount charged.
    const products = await db.product.findMany({
      where: { id: { in: cart.lines.map((l) => l.productId) } },
      select: {
        id: true,
        sku: true,
        price: true,
        priceOnRequest: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        translations: { where: { locale: data.locale }, select: { name: true } },
      },
    });

    const items = cart.lines.flatMap((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return [];
      const price = toNumber(product.price);
      const quoteOnly = product.priceOnRequest || price <= 0;
      const unit = quoteOnly ? 0 : price;
      return [
        {
          productId: product.id,
          name: product.translations[0]?.name ?? line.name,
          sku: product.sku,
          image: product.images[0]?.url ?? null,
          price: unit,
          quantity: line.quantity,
          total: unit * line.quantity,
          quoteOnly,
        },
      ];
    });
    if (items.length === 0) return { ok: false, error: "empty" };

    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const needsQuote = items.some((i) => i.quoteOnly);

    let orderNumber = buildOrderNumber();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const clash = await db.order.findUnique({ where: { orderNumber }, select: { id: true } });
      if (!clash) break;
      orderNumber = buildOrderNumber();
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer?.id ?? null,
        status: "NEW",
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        currency: settings.currency,
        subtotal,
        total: subtotal,
        needsQuote,
        locale: data.locale,
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email || customer?.email || null,
        phone: data.phone,
        city: data.city || null,
        addressLine: data.addressLine || null,
        comment: data.comment || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          })),
        },
        history: { create: { status: "NEW", note: "Created from storefront" } },
      },
      select: { id: true, orderNumber: true },
    });

    await emptyCurrentCart();

    return { ok: true, orderNumber: order.orderNumber };
  } catch {
    return { ok: false, error: "failed" };
  }
}
