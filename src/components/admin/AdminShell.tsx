"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  X,
} from "lucide-react";
import { adminLogout } from "@/app/actions/admin-auth";

const NAV = [
  { href: "/admin", label: "Обзор", Icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Заказы", Icon: ShoppingCart },
  { href: "/admin/leads", label: "Заявки", Icon: MessageSquare },
  { href: "/admin/products", label: "Товары", Icon: Package },
  { href: "/admin/categories", label: "Категории", Icon: ListTree },
  { href: "/admin/brands", label: "Бренды", Icon: Tags },
  { href: "/admin/customers", label: "Клиенты", Icon: Users },
  { href: "/admin/posts", label: "Блог", Icon: Newspaper },
  { href: "/admin/pages", label: "Страницы", Icon: Newspaper },
  { href: "/admin/slides", label: "Слайдер", Icon: ImageIcon },
  { href: "/admin/settings", label: "Настройки", Icon: Settings },
];

export function AdminShell({
  admin,
  badges,
  children,
}: {
  admin: { name: string; email: string; role: string };
  badges: { orders: number; leads: number };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const badgeFor = (href: string) =>
    href === "/admin/orders" ? badges.orders : href === "/admin/leads" ? badges.leads : 0;

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact);
          const badge = badgeFor(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-brand-600 font-semibold text-white"
                    : "text-ink-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="flex-1">{label}</span>
                {badge > 0 ? (
                  <span
                    className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                      active ? "bg-white text-brand-600" : "bg-brand-600 text-white"
                    }`}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-400 transition hover:text-white"
      >
        <ExternalLink className="size-3.5" aria-hidden />
        Открыть сайт
      </Link>
      <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">{admin.name}</p>
          <p className="truncate text-[11px] text-ink-400">{admin.email}</p>
        </div>
        <button
          type="button"
          disabled={pending}
          aria-label="Выйти"
          onClick={() =>
            startTransition(async () => {
              await adminLogout();
              router.replace("/admin/login");
              router.refresh();
            })
          }
          className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 shrink-0 flex-col bg-ink-900 lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white">
            United Sport
          </p>
          <p className="mt-0.5 text-[11px] text-ink-400">Панель управления</p>
        </div>
        {nav}
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-ink-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Меню"
            className="grid size-10 place-items-center rounded-lg text-ink-700 transition hover:bg-ink-100"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <p className="font-display text-sm font-extrabold uppercase tracking-wider">United Sport</p>
        </header>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink-900">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <p className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
                  Меню
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  className="grid size-9 place-items-center rounded-lg text-ink-300 transition hover:bg-white/10"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              {nav}
              {footer}
            </div>
          </div>
        ) : null}

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
