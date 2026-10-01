"use client";

import { useState } from "react";
import { QuantityStepper } from "./QuantityStepper";
import { AddToCartButton } from "./AddToCartButton";

export function BuyBox({
  productId,
  labels,
  disabled = false,
}: {
  productId: number;
  labels: { quantity: string; add: string; added: string; error: string };
  disabled?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <QuantityStepper value={quantity} onChange={setQuantity} label={labels.quantity} />
      <AddToCartButton
        productId={productId}
        quantity={quantity}
        size="lg"
        className="min-w-48 flex-1"
        labels={{ add: labels.add, added: labels.added, error: labels.error }}
      />
      {disabled ? null : null}
    </div>
  );
}
