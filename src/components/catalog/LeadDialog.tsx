"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { submitLead } from "@/app/actions/lead";
import type { Locale } from "@/i18n/routing";
import { buttonClass } from "@/components/ui/Button";

export type LeadLabels = {
  trigger: string;
  title: string;
  text: string;
  name: string;
  phone: string;
  message: string;
  send: string;
  sending: string;
  sent: string;
  sentText: string;
  close: string;
  required: string;
  error: string;
};

export function LeadDialog({
  labels,
  locale,
  productId,
  type = "PRICE_REQUEST",
  variant = "primary",
  size = "md",
  className = "",
  productName,
}: {
  labels: LeadLabels;
  locale: Locale;
  productId?: number;
  type?: "CALLBACK" | "PRICE_REQUEST" | "CONTACT";
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  productName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitLead({
        type,
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        message: String(formData.get("message") ?? ""),
        website: String(formData.get("website") ?? ""),
        productId,
        locale,
      });
      if (result.ok) setDone(true);
      else setError(result.error === "invalid" ? labels.required : labels.error);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDone(false);
          setOpen(true);
        }}
        className={buttonClass(variant, size, className)}
      >
        {labels.trigger}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-title"
            className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-pop sm:rounded-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.close}
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-ink-500 transition hover:bg-ink-100"
            >
              <X className="size-5" aria-hidden />
            </button>

            {done ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto size-12 text-brand-600" aria-hidden />
                <h2 id="lead-title" className="mt-4 text-xl font-bold">
                  {labels.sent}
                </h2>
                <p className="mt-2 text-sm text-ink-500">{labels.sentText}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={buttonClass("outline", "md", "mt-6 w-full")}
                >
                  {labels.close}
                </button>
              </div>
            ) : (
              <form action={onSubmit} className="space-y-4">
                <div>
                  <h2 id="lead-title" className="pr-8 text-xl font-bold">
                    {labels.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-500">{labels.text}</p>
                  {productName ? (
                    <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-700">
                      {productName}
                    </p>
                  ) : null}
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-ink-600">
                    {labels.name}
                  </span>
                  <input
                    name="name"
                    required
                    minLength={2}
                    autoComplete="name"
                    className="h-11 w-full rounded-lg border border-ink-200 px-3.5 text-sm outline-none transition focus:border-brand-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-ink-600">
                    {labels.phone}
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+998 __ ___ __ __"
                    className="h-11 w-full rounded-lg border border-ink-200 px-3.5 text-sm outline-none transition focus:border-brand-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-ink-600">
                    {labels.message}
                  </span>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500"
                  />
                </label>

                {/* Honeypot: hidden from people, irresistible to bots. */}
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute left-[-9999px] size-0 opacity-0"
                />

                {error ? <p className="text-sm font-semibold text-brand-600">{error}</p> : null}

                <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
                  {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {pending ? labels.sending : labels.send}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
