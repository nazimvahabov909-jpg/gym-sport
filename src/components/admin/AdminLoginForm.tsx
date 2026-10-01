"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { adminLogin } from "@/app/actions/admin-auth";
import { buttonClass } from "@/components/ui/Button";

const field =
  "h-11 w-full rounded-lg border border-ink-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-500";

export function AdminLoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await adminLogin({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (result.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      setError(
        result.error === "credentials"
          ? "Неверный e-mail или пароль"
          : "Не удалось войти. Попробуйте ещё раз.",
      );
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-600">E-mail</span>
        <input name="email" type="email" required autoComplete="username" className={field} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-600">Пароль</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        Войти
      </button>
    </form>
  );
}
