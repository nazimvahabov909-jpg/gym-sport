"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/app/actions/auth";

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await logout();
          router.replace("/");
          router.refresh();
        })
      }
      className="flex items-center gap-2 text-sm font-semibold text-ink-500 transition hover:text-brand-600 disabled:opacity-50"
    >
      <LogOut className="size-4" aria-hidden />
      {label}
    </button>
  );
}
