"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { CategoryNode } from "@/lib/queries/catalog";
import { SearchForm } from "./SearchForm";

type Labels = {
  menu: string;
  close: string;
  search: string;
  searchPlaceholder: string;
  catalog: string;
  brands: string;
  blog: string;
  about: string;
  contacts: string;
  account: string;
};

export function MobileMenu({
  categories,
  labels,
  phone,
}: {
  categories: CategoryNode[];
  labels: Labels;
  phone: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  // A drawer that scrolls the page behind it feels broken on iOS.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.menu}
        className="grid size-10 place-items-center rounded-full text-ink-900 transition hover:bg-ink-100 lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={labels.menu}
            className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col bg-white shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ink-500">
                {labels.menu}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label={labels.close}
                className="grid size-10 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="border-b border-ink-100 px-4 py-3">
              <SearchForm
                label={labels.search}
                placeholder={labels.searchPlaceholder}
                onDone={close}
              />
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
              <ul>
                {categories.map((category) => (
                  <li key={category.id} className="border-b border-ink-50 last:border-0">
                    <div className="flex items-center">
                      <Link
                        href={`/catalog/${category.slug}`}
                        onClick={close}
                        className="flex-1 px-3 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-ink-900"
                      >
                        {category.name}
                      </Link>
                      {category.children.length ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((v) => (v === category.id ? null : category.id))
                          }
                          aria-expanded={expanded === category.id}
                          aria-label={category.name}
                          className="grid size-10 place-items-center rounded-full text-ink-500 transition hover:bg-ink-100"
                        >
                          <ChevronDown
                            className={`size-4 transition ${expanded === category.id ? "rotate-180" : ""}`}
                            aria-hidden
                          />
                        </button>
                      ) : null}
                    </div>
                    {expanded === category.id ? (
                      <ul className="pb-2 pl-3">
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/catalog/${child.slug}`}
                              onClick={close}
                              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-600 transition hover:bg-ink-50"
                            >
                              {child.name}
                              <span className="text-xs text-ink-400">{child.productCount}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>

              <ul className="mt-4 border-t border-ink-100 pt-2">
                {[
                  { href: "/catalog", label: labels.catalog },
                  { href: "/brands", label: labels.brands },
                  { href: "/blog", label: labels.blog },
                  { href: "/info/about", label: labels.about },
                  { href: "/contacts", label: labels.contacts },
                  { href: "/account", label: labels.account },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="block rounded-lg px-3 py-2.5 text-sm text-ink-700 transition hover:bg-ink-50"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="flex items-center justify-center gap-2 border-t border-ink-100 bg-brand-600 px-4 py-4 font-semibold text-white"
            >
              <Phone className="size-4" aria-hidden />
              {phone}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
