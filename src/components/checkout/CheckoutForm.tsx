"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { placeOrder } from "@/app/actions/order";
import { buttonClass } from "@/components/ui/Button";

export type CheckoutLabels = {
  contact: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  addressLine: string;
  comment: string;
  payment: string;
  paymentCash: string;
  paymentTransfer: string;
  paymentCard: string;
  placeOrder: string;
  sending: string;
  invalid: string;
  empty: string;
  error: string;
};

const field =
  "h-11 w-full rounded-lg border border-ink-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-500";

export function CheckoutForm({
  locale,
  labels,
  defaults,
}: {
  locale: Locale;
  labels: CheckoutLabels;
  defaults: { firstName?: string; lastName?: string; phone?: string; email?: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<"CASH" | "BANK_TRANSFER" | "CARD_ON_DELIVERY">("CASH");

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        city: String(formData.get("city") ?? ""),
        addressLine: String(formData.get("addressLine") ?? ""),
        comment: String(formData.get("comment") ?? ""),
        website: String(formData.get("website") ?? ""),
        paymentMethod: payment,
        locale,
      });

      if (result.ok) {
        router.replace(`/checkout/success?order=${encodeURIComponent(result.orderNumber)}`);
        return;
      }
      setError(
        result.error === "invalid"
          ? labels.invalid
          : result.error === "empty"
            ? labels.empty
            : labels.error,
      );
    });
  }

  const payments = [
    { value: "CASH", label: labels.paymentCash },
    { value: "BANK_TRANSFER", label: labels.paymentTransfer },
    { value: "CARD_ON_DELIVERY", label: labels.paymentCard },
  ] as const;

  return (
    <form action={onSubmit} className="space-y-8">
      <fieldset>
        <legend className="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink-500">
          {labels.contact}
        </legend>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">
              {labels.firstName} *
            </span>
            <input
              name="firstName"
              required
              minLength={2}
              defaultValue={defaults.firstName}
              autoComplete="given-name"
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.lastName}</span>
            <input
              name="lastName"
              defaultValue={defaults.lastName}
              autoComplete="family-name"
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.phone} *</span>
            <input
              name="phone"
              type="tel"
              required
              inputMode="tel"
              defaultValue={defaults.phone}
              placeholder="+998 __ ___ __ __"
              autoComplete="tel"
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.email}</span>
            <input
              name="email"
              type="email"
              defaultValue={defaults.email}
              autoComplete="email"
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.city}</span>
            <input name="city" autoComplete="address-level2" className={field} />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">
              {labels.addressLine}
            </span>
            <input name="addressLine" autoComplete="street-address" className={field} />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.comment}</span>
            <textarea
              name="comment"
              rows={3}
              className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500"
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink-500">
          {labels.payment}
        </legend>
        <div className="mt-4 space-y-2">
          {payments.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 text-sm transition ${
                payment === option.value
                  ? "border-brand-600 bg-brand-50/50"
                  : "border-ink-200 hover:border-ink-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={payment === option.value}
                onChange={() => setPayment(option.value)}
                className="size-4 accent-brand-600"
              />
              <span className="font-medium text-ink-800">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] size-0 opacity-0"
      />

      {error ? (
        <p role="alert" className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? labels.sending : labels.placeOrder}
      </button>
    </form>
  );
}
