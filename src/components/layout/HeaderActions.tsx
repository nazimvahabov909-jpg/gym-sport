"use client";

import { ShoppingBag, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSession } from "./SessionProvider";

export function CartButton({ label }: { label: string }) {
  const { cartCount } = useSession();

  return (
    <Link
      href="/cart"
      aria-label={cartCount > 0 ? `${label} (${cartCount})` : label}
      className="relative grid size-10 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100 hover:text-ink-900"
    >
      <ShoppingBag className="size-5" aria-hidden />
      {cartCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold leading-5 text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      ) : null}
    </Link>
  );
}

export function AccountButton({
  labels,
}: {
  labels: { account: string; signIn: string };
}) {
  const { signedIn } = useSession();

  return (
    <Link
      href={signedIn ? "/account" : "/account/login"}
      aria-label={signedIn ? labels.account : labels.signIn}
      className="grid size-10 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100 hover:text-ink-900"
    >
      <User className="size-5" aria-hidden />
    </Link>
  );
}
