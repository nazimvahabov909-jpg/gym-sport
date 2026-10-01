import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Heart, Package, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LogoutButton } from "@/components/account/LogoutButton";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("account.title"), robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/${locale}/account/login`);

  const [t, settings, orders, wishlistCount] = await Promise.all([
    getTranslations(),
    getSettings(),
    db.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        needsQuote: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    db.wishlistItem.count({ where: { customerId: customer.id } }),
  ]);

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ name: t("account.title") }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold md:text-4xl">{t("account.title")}</h1>
          <p className="mt-2 text-sm text-ink-500">
            {customer.firstName} {customer.lastName ?? ""} · {customer.email}
          </p>
        </div>
        <LogoutButton label={t("account.logout")} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { Icon: Package, label: t("account.orders"), value: orders.length, href: "/account" },
          { Icon: Heart, label: t("nav.wishlist"), value: wishlistCount, href: "/account/wishlist" },
          { Icon: User, label: t("account.profile"), value: null, href: "/account" },
        ].map(({ Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-card border border-ink-100 p-5 transition hover:border-ink-300"
          >
            <span className="grid size-11 place-items-center rounded-full bg-ink-50 text-brand-600">
              <Icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink-900">{label}</span>
              {value !== null ? (
                <span className="block text-xs text-ink-500">{value}</span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold">{t("account.orders")}</h2>

        {orders.length === 0 ? (
          <p className="mt-4 rounded-card border border-dashed border-ink-200 px-6 py-12 text-center text-sm text-ink-500">
            {t("account.noOrders")}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100 border-y border-ink-100">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                <span className="font-display text-sm font-bold">{order.orderNumber}</span>
                <span className="text-xs text-ink-500">{formatDateTime(order.createdAt, locale)}</span>
                <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  {order.status}
                </span>
                <span className="ml-auto text-sm font-extrabold">
                  {order.needsQuote ? "—" : formatMoney(order.total, locale, settings.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
