"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  label,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  max?: number;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(1, n));

  return (
    <div className="inline-flex h-11 items-center rounded-full border border-ink-200">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 1}
        aria-label={`${label} −`}
        className="grid size-11 place-items-center rounded-full text-ink-600 transition hover:bg-ink-50 disabled:opacity-40"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <label className="sr-only" htmlFor="qty">
        {label}
      </label>
      <input
        id="qty"
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-full w-10 border-0 bg-transparent text-center text-sm font-bold outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`${label} +`}
        className="grid size-11 place-items-center rounded-full text-ink-600 transition hover:bg-ink-50 disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
