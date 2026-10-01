"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { login, register, type AuthResult } from "@/app/actions/auth";
import { buttonClass } from "@/components/ui/Button";

export type AuthLabels = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  submit: string;
  sending: string;
  credentials: string;
  taken: string;
  short: string;
  invalid: string;
  error: string;
};

const field =
  "h-11 w-full rounded-lg border border-ink-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-500";

export function AuthForm({
  mode,
  labels,
  locale,
  redirectTo = "/account",
}: {
  mode: "login" | "register";
  labels: AuthLabels;
  locale: Locale;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      const result: AuthResult =
        mode === "login"
          ? await login({ email, password })
          : await register({
              email,
              password,
              firstName: String(formData.get("firstName") ?? ""),
              lastName: String(formData.get("lastName") ?? ""),
              phone: String(formData.get("phone") ?? ""),
              locale,
            });

      if (result.ok) {
        router.replace(redirectTo);
        router.refresh();
        return;
      }
      setError(
        {
          credentials: labels.credentials,
          taken: labels.taken,
          short: labels.short,
          invalid: labels.invalid,
          failed: labels.error,
        }[result.error],
      );
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {mode === "register" ? (
        <>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">
              {labels.firstName} *
            </span>
            <input name="firstName" required minLength={2} autoComplete="given-name" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.lastName}</span>
            <input name="lastName" autoComplete="family-name" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.phone}</span>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" className={field} />
          </label>
        </>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.email} *</span>
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-600">{labels.password} *</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : 1}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className={field}
        />
      </label>

      {error ? (
        <p role="alert" className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
