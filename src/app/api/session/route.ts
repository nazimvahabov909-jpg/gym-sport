import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";

/**
 * Everything the storefront chrome needs to know about *this* visitor.
 *
 * Keeping it in one uncached endpoint is what lets every catalogue page stay
 * statically rendered: the pages hold no per-visitor state, and the header,
 * cart badge and wishlist hearts hydrate from here instead.
 */
export async function GET() {
  const [customer, cartCount] = await Promise.all([getCurrentCustomer(), getCartCount()]);

  const wishlist = customer
    ? await db.wishlistItem.findMany({
        where: { customerId: customer.id },
        select: { productId: true },
      })
    : [];

  return NextResponse.json(
    {
      cartCount,
      signedIn: Boolean(customer),
      firstName: customer?.firstName ?? null,
      wishlist: wishlist.map((w) => w.productId),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
