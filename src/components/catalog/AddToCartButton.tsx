"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { addToCart } from "@/app/actions/cart";
import { useSession } from "@/components/layout/SessionProvider";
import { buttonClass } from "@/components/ui/Button";

type Props = {
  productId: number;
  quantity?: number;
  labels: { add: string; added: string; error: string };
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
};

export function AddToCartButton({
  productId,
  quantity = 1,
  labels,
  size = "md",
  className = "",
  iconOnly = false,
}: Props) {
  const { refresh } = useSession();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  function submit() {
    setError(false);
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (!result.ok) {
        setError(true);
        return;
      }
      setDone(true);
      // Only the badge changes, so refresh the session rather than the page.
      void refresh();
      setTimeout(() => setDone(false), 2200);
    });
  }

  const Icon = pending ? Loader2 : done ? Check : ShoppingBag;
  const label = error ? labels.error : done ? labels.added : labels.add;

  return (
    <button
      type="button"
      onClick={submit}
      disabled={pending}
      aria-label={iconOnly ? label : undefined}
      className={buttonClass(done ? "secondary" : "primary", size, className)}
    >
      <Icon className={`size-4 shrink-0 ${pending ? "animate-spin" : ""}`} aria-hidden />
      {iconOnly ? null : <span className="truncate">{label}</span>}
    </button>
  );
}
