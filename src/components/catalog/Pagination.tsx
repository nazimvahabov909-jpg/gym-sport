import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Compact window: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current: number, total: number) {
  const pages = new Set<number>([1, total, current]);
  for (const delta of [-2, -1, 1, 2]) {
    const p = current + delta;
    if (p > 1 && p < total) pages.add(p);
  }
  return [...pages].sort((a, b) => a - b);
}

export async function Pagination({
  page,
  pageCount,
  basePath,
  searchParams = {},
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  if (pageCount <= 1) return null;
  const t = await getTranslations();

  const href = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (!value || key === "page") continue;
      // Multi-select filters (brand) must survive paging as repeated keys.
      for (const item of Array.isArray(value) ? value : [value]) params.append(key, item);
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = pageWindow(page, pageCount);
  const cell =
    "grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-semibold transition";

  return (
    <nav aria-label={t("common.page")} className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label={t("common.prev")} className={`${cell} border-ink-200 text-ink-700 hover:border-ink-900`}>
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : null}

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 ? <span className="px-1 text-ink-400">…</span> : null}
          {p === page ? (
            <span aria-current="page" className={`${cell} border-brand-600 bg-brand-600 text-white`}>
              {p}
            </span>
          ) : (
            <Link href={href(p)} className={`${cell} border-ink-200 text-ink-700 hover:border-ink-900`}>
              {p}
            </Link>
          )}
        </span>
      ))}

      {page < pageCount ? (
        <Link href={href(page + 1)} aria-label={t("common.next")} className={`${cell} border-ink-200 text-ink-700 hover:border-ink-900`}>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
