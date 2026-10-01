import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { CategoryNode } from "@/lib/queries/catalog";
import { Tilt } from "./Tilt";

/**
 * Category tiles as a tilting deck. The first tile is deliberately larger —
 * on a phone the deck becomes a plain stack, so nothing depends on the hover.
 */
export function CategoryDeck({
  categories,
  countLabel,
}: {
  categories: CategoryNode[];
  countLabel: (count: number) => string;
}) {
  return (
    <div className="stage grid gap-4 md:grid-cols-3 md:gap-5">
      {categories.map((category, i) => (
        <Tilt
          key={category.id}
          max={7}
          className={i === 0 ? "md:col-span-1" : ""}
        >
          <Link
            href={`/catalog/${category.slug}`}
            className="group relative flex aspect-[16/11] flex-col justify-end overflow-hidden rounded-2xl bg-ink-900 p-5 md:aspect-[3/4] md:p-6"
          >
            {category.image ? (
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/55 to-ink-900/5" />

            <span
              aria-hidden
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition group-hover:border-brand-500 group-hover:bg-brand-600 md:right-5 md:top-5"
            >
              <ArrowUpRight className="size-4" />
            </span>

            <div className="relative" style={{ transform: "translateZ(30px)" }}>
              <p className="font-display text-xl font-extrabold uppercase leading-tight tracking-tight text-white md:text-2xl">
                {category.name}
              </p>
              <p className="mt-1.5 text-xs text-white/55">{countLabel(category.productCount)}</p>

              {category.children.length ? (
                <ul className="mt-4 hidden flex-wrap gap-1.5 md:flex">
                  {category.children.slice(0, 3).map((child) => (
                    <li
                      key={child.id}
                      className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70"
                    >
                      {child.name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Link>
        </Tilt>
      ))}
    </div>
  );
}
