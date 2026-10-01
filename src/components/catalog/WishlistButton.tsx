"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { toggleWishlist } from "@/app/actions/wishlist";
import { useSession } from "@/components/layout/SessionProvider";

export function WishlistButton({
  productId,
  labels,
}: {
  productId: number;
  labels: { add: string; signIn: string };
}) {
  const router = useRouter();
  const { wishlist, setWishlist } = useSession();
  const [pending, startTransition] = useTransition();
  const active = wishlist.includes(productId);

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={active}
      aria-label={labels.add}
      title={labels.add}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleWishlist(productId);
          if (result.ok) {
            setWishlist(productId, result.inWishlist);
            return;
          }
          // Not signed in — the wishlist is tied to an account.
          if (result.error === "auth") router.push("/account/login");
        })
      }
      className={`grid size-11 shrink-0 place-items-center rounded-full border transition ${
        active
          ? "border-brand-600 bg-brand-50 text-brand-600"
          : "border-ink-200 text-ink-500 hover:border-ink-900 hover:text-ink-900"
      }`}
    >
      <Heart className={`size-5 ${active ? "fill-current" : ""}`} aria-hidden />
    </button>
  );
}
