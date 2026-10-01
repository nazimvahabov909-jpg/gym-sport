import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type Crumb = { name: string; href?: string };

export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = await getTranslations();

  return (
    <nav aria-label="breadcrumb" className="py-4 text-xs text-ink-500 md:py-5">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="transition hover:text-brand-600">
            {t("nav.home")}
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="flex items-center gap-1.5">
            <ChevronRight className="size-3 text-ink-300" aria-hidden />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="transition hover:text-brand-600">
                {item.name}
              </Link>
            ) : (
              <span className="text-ink-900" aria-current="page">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
