"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { ArrowUpDown, Check, SlidersHorizontal, X } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

export type BrandOption = { slug: string; name: string; count: number };

export type ControlLabels = {
  filters: string;
  sort: string;
  brand: string;
  inStockOnly: string;
  apply: string;
  reset: string;
  close: string;
  sortOptions: { value: string; label: string }[];
};

/**
 * Filters and sorting live in the URL so every state is shareable, indexable
 * and survives a refresh. The sheet only mirrors them locally while open.
 */
export function CatalogControls({
  brands,
  labels,
  total,
  resultsLabel,
}: {
  brands: BrandOption[];
  labels: ControlLabels;
  total: number;
  resultsLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeBrands = params.getAll("brand");
  const inStock = params.get("stock") === "1";
  const sort = params.get("sort") ?? "name";

  const [open, setOpen] = useState(false);
  const [draftBrands, setDraftBrands] = useState<string[]>(activeBrands);
  const [draftStock, setDraftStock] = useState(inStock);

  // The effect only touches the DOM; the draft is seeded when the sheet opens
  // so React state never cascades through a render pass.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const openSheet = () => {
    setDraftBrands(params.getAll("brand"));
    setDraftStock(params.get("stock") === "1");
    setOpen(true);
  };

  const push = useCallback(
    (next: URLSearchParams) => {
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: true });
    },
    [pathname, router],
  );

  const applyDraft = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("brand");
    for (const slug of draftBrands) next.append("brand", slug);
    if (draftStock) next.set("stock", "1");
    else next.delete("stock");
    setOpen(false);
    push(next);
  };

  const resetAll = () => {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    setDraftBrands([]);
    setDraftStock(false);
    setOpen(false);
    push(next);
  };

  const changeSort = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "name") next.delete("sort");
    else next.set("sort", value);
    push(next);
  };

  const activeCount = activeBrands.length + (inStock ? 1 : 0);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openSheet}
          className={buttonClass("outline", "sm", "relative")}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {labels.filters}
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>

        <label className="relative flex items-center">
          <span className="sr-only">{labels.sort}</span>
          <ArrowUpDown className="pointer-events-none absolute left-3.5 size-4 text-ink-400" aria-hidden />
          <select
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            className="h-9 appearance-none rounded-full border border-ink-200 bg-white pl-10 pr-8 text-sm font-semibold text-ink-900 outline-none transition hover:border-ink-900 focus:border-brand-500"
          >
            {labels.sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <p className="ml-auto text-sm text-ink-500">
          {resultsLabel}: <span className="font-semibold text-ink-900">{total}</span>
        </p>
      </div>

      {activeCount > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeBrands.map((slug) => {
            const brand = brands.find((b) => b.slug === slug);
            return (
              <button
                key={slug}
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(params.toString());
                  next.delete("brand");
                  for (const s of activeBrands.filter((b) => b !== slug)) next.append("brand", s);
                  push(next);
                }}
                className="flex items-center gap-1.5 rounded-full bg-ink-100 py-1 pl-3 pr-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-200"
              >
                {brand?.name ?? slug}
                <X className="size-3.5" aria-hidden />
              </button>
            );
          })}
          {inStock ? (
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(params.toString());
                next.delete("stock");
                push(next);
              }}
              className="flex items-center gap-1.5 rounded-full bg-ink-100 py-1 pl-3 pr-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-200"
            >
              {labels.inStockOnly}
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            onClick={resetAll}
            className="text-xs font-semibold text-brand-600 underline-offset-2 hover:underline"
          >
            {labels.reset}
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-ink-900/45" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={labels.filters}
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl bg-white sm:inset-y-0 sm:right-0 sm:left-auto sm:w-96 sm:max-h-none sm:rounded-none"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 className="font-display text-base font-bold">{labels.filters}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                className="grid size-9 place-items-center rounded-full text-ink-600 transition hover:bg-ink-100"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <fieldset>
                <legend className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
                  {labels.brand}
                </legend>
                <ul className="space-y-1">
                  {brands.map((brand) => {
                    const checked = draftBrands.includes(brand.slug);
                    return (
                      <li key={brand.slug}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-ink-50">
                          <span
                            className={`grid size-5 shrink-0 place-items-center rounded border transition ${
                              checked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300"
                            }`}
                          >
                            {checked ? <Check className="size-3.5" aria-hidden /> : null}
                          </span>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() =>
                              setDraftBrands((prev) =>
                                prev.includes(brand.slug)
                                  ? prev.filter((s) => s !== brand.slug)
                                  : [...prev, brand.slug],
                              )
                            }
                          />
                          <span className="flex-1 text-sm text-ink-800">{brand.name}</span>
                          <span className="text-xs text-ink-400">{brand.count}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>

              <label className="mt-5 flex cursor-pointer items-center gap-3 border-t border-ink-100 px-2 pt-5">
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded border transition ${
                    draftStock ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300"
                  }`}
                >
                  {draftStock ? <Check className="size-3.5" aria-hidden /> : null}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={draftStock}
                  onChange={() => setDraftStock((v) => !v)}
                />
                <span className="text-sm text-ink-800">{labels.inStockOnly}</span>
              </label>
            </div>

            <div className="flex gap-3 border-t border-ink-100 px-5 py-4">
              <button type="button" onClick={resetAll} className={buttonClass("outline", "md", "flex-1")}>
                {labels.reset}
              </button>
              <button type="button" onClick={applyDraft} className={buttonClass("primary", "md", "flex-1")}>
                {labels.apply}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
