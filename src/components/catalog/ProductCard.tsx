import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatMoney } from "@/lib/format";
import type { ProductCardData } from "@/lib/queries/catalog";
import { AddToCartButton } from "./AddToCartButton";

export async function ProductCard({
  product,
  locale,
  currency,
  priority = false,
}: {
  product: ProductCardData;
  locale: Locale;
  currency: string;
  priority?: boolean;
}) {
  const t = await getTranslations();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-ink-100 bg-white transition hover:border-ink-200 hover:shadow-card">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-ink-50/60"
        tabIndex={-1}
        aria-hidden
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-3 transition duration-500 group-hover:scale-[1.04] md:p-5"
          />
        ) : (
          <div className="grid size-full place-items-center text-xs text-ink-300">—</div>
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.isNew ? (
            <span className="rounded-full bg-navy-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              new
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="rounded-full bg-ink-900/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {t("product.outOfStock")}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
        {product.brand ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            {product.brand}
          </p>
        ) : null}

        <h3 className="clamp-2 text-sm font-semibold leading-snug text-ink-900 md:text-[15px]">
          <Link href={`/product/${product.slug}`} className="transition hover:text-brand-600">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-2">
          {product.priceOnRequest ? (
            <p className="text-sm font-bold text-navy-800">{t("product.priceOnRequest")}</p>
          ) : (
            <p className="flex flex-wrap items-baseline gap-2">
              <span className="text-base font-extrabold text-ink-900 md:text-lg">
                {formatMoney(product.price, locale, currency)}
              </span>
              {product.oldPrice && product.oldPrice > product.price ? (
                <span className="text-xs text-ink-400 line-through">
                  {formatMoney(product.oldPrice, locale, currency)}
                </span>
              ) : null}
            </p>
          )}

          <AddToCartButton
            productId={product.id}
            size="sm"
            className="mt-3 w-full"
            labels={{
              add: t("product.addToCart"),
              added: t("product.inCart"),
              error: t("common.somethingWrong"),
            }}
          />
        </div>
      </div>
    </article>
  );
}

export async function ProductGrid({
  products,
  locale,
  currency,
  priorityCount = 0,
  variant = "grid",
}: {
  products: ProductCardData[];
  locale: Locale;
  currency: string;
  priorityCount?: number;
  /** "rail" turns into a swipeable row on phones and a 4-up grid from md. */
  variant?: "grid" | "rail";
}) {
  const layout =
    variant === "rail"
      ? "rail"
      : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:gap-5";

  return (
    <div className={layout}>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          currency={currency}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
