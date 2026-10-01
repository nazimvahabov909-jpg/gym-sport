"use client";

import { useOptimistic, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/lib/cart";
import { removeFromCart, setCartQuantity } from "@/app/actions/cart";
import { QuantityStepper } from "@/components/catalog/QuantityStepper";

type Labels = {
  quantity: string;
  remove: string;
  priceOnRequest: string;
  sku: string;
};

export function CartLines({
  lines,
  labels,
  locale,
  currency,
}: {
  lines: CartLine[];
  labels: Labels;
  locale: Locale;
  currency: string;
}) {
  // Formatting happens here rather than on the server because quantities change
  // optimistically in the browser — a function prop could not cross the RSC wire.
  const formatPrice = (value: number) => formatMoney(value, locale, currency);
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimistic, applyOptimistic] = useOptimistic(
    lines,
    (state: CartLine[], action: { productId: number; quantity: number }) =>
      action.quantity <= 0
        ? state.filter((l) => l.productId !== action.productId)
        : state.map((l) =>
            l.productId === action.productId
              ? {
                  ...l,
                  quantity: action.quantity,
                  lineTotal: l.priceOnRequest ? 0 : l.price * action.quantity,
                }
              : l,
          ),
  );

  function change(productId: number, quantity: number) {
    startTransition(async () => {
      applyOptimistic({ productId, quantity });
      await (quantity <= 0 ? removeFromCart(productId) : setCartQuantity(productId, quantity));
      router.refresh();
    });
  }

  return (
    <ul className="divide-y divide-ink-100 border-y border-ink-100">
      {optimistic.map((line) => (
        <li key={line.productId} className="flex gap-4 py-5">
          <Link
            href={`/product/${line.slug}`}
            className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-white sm:size-24"
          >
            {line.image ? (
              <Image src={line.image} alt="" fill sizes="96px" className="object-contain p-1.5" />
            ) : null}
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="clamp-2 text-sm font-semibold leading-snug">
                <Link href={`/product/${line.slug}`} className="transition hover:text-brand-600">
                  {line.name}
                </Link>
              </h3>
              {line.sku ? (
                <p className="mt-1 text-xs text-ink-400">
                  {labels.sku}: {line.sku}
                </p>
              ) : null}
              <p className="mt-1.5 text-sm font-bold text-ink-900">
                {line.priceOnRequest ? (
                  <span className="text-navy-800">{labels.priceOnRequest}</span>
                ) : (
                  formatPrice(line.price)
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <QuantityStepper
                value={line.quantity}
                onChange={(next) => change(line.productId, next)}
                label={labels.quantity}
              />

              <p className="ml-auto min-w-24 text-right text-sm font-extrabold sm:min-w-28">
                {line.priceOnRequest ? "—" : formatPrice(line.lineTotal)}
              </p>

              <button
                type="button"
                onClick={() => change(line.productId, 0)}
                aria-label={labels.remove}
                className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
