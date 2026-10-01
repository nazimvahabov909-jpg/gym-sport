"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleProductActive } from "@/app/actions/admin";

export function ProductActiveToggle({
  productId,
  isActive: initial,
}: {
  productId: number;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={isActive ? "Скрыть товар" : "Показать товар"}
      disabled={pending}
      onClick={() => {
        const next = !isActive;
        setIsActive(next);
        startTransition(async () => {
          const result = await toggleProductActive(productId, next);
          if (!result.ok) setIsActive(!next);
          router.refresh();
        });
      }}
      className={`relative h-6 w-11 rounded-full transition disabled:opacity-60 ${
        isActive ? "bg-emerald-500" : "bg-ink-300"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
          isActive ? "left-[1.375rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}
