import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { EmptyState, PageHeader, StatusBadge, Table } from "@/components/admin/ui";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/admin/labels";
import type { OrderStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Заказы" };

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
const PER_PAGE = 30;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const query = (sp.q ?? "").trim();

  const where = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query } },
            { phone: { contains: query } },
            { firstName: { contains: query } },
          ],
        }
      : {}),
  };

  const [settings, orders, total] = await Promise.all([
    getSettings(),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        status: true,
        paymentStatus: true,
        total: true,
        needsQuote: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const linkFor = (params: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries({ status, q: query || undefined, ...params })) {
      if (value) qs.set(key, String(value));
    }
    const s = qs.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  };

  return (
    <>
      <PageHeader title="Заказы" description={`Всего: ${total}`} />

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/orders">
        <input
          name="q"
          defaultValue={query}
          placeholder="Номер, телефон или имя"
          className="h-9 w-full max-w-xs rounded-lg border border-ink-200 px-3 text-sm outline-none transition focus:border-brand-500"
        />
        <button type="submit" className="h-9 rounded-lg bg-ink-900 px-4 text-sm font-semibold text-white">
          Найти
        </button>
      </form>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href={linkFor({ status: undefined, page: undefined })}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            !status ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-ink-400"
          }`}
        >
          Все
        </Link>
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={linkFor({ status: value, page: undefined })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              status === value
                ? "bg-ink-900 text-white"
                : "bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-ink-400"
            }`}
          >
            {ORDER_STATUS_LABELS[value]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="Заказов не найдено" />
      ) : (
        <Table
          head={
            <>
              <th>Номер</th>
              <th>Клиент</th>
              <th>Позиций</th>
              <th>Статус</th>
              <th>Оплата</th>
              <th className="text-right">Сумма</th>
            </>
          }
        >
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link href={`/admin/orders/${order.id}`} className="font-semibold text-brand-600 hover:underline">
                  {order.orderNumber}
                </Link>
                <p className="mt-0.5 text-xs text-ink-400">{formatDateTime(order.createdAt)}</p>
              </td>
              <td>
                <p className="font-medium">
                  {order.firstName} {order.lastName ?? ""}
                </p>
                <p className="text-xs text-ink-400">
                  {order.phone}
                  {order.city ? ` · ${order.city}` : ""}
                </p>
              </td>
              <td className="text-ink-600">{order._count.items}</td>
              <td>
                <StatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
              </td>
              <td>
                <StatusBadge
                  status={order.paymentStatus}
                  label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
                />
              </td>
              <td className="whitespace-nowrap text-right font-bold">
                {order.needsQuote ? (
                  <span className="text-navy-800">по запросу</span>
                ) : (
                  formatMoney(order.total, "ru", settings.currency)
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Link href={linkFor({ page: String(page - 1) })} className="rounded-lg border border-ink-200 bg-white px-3 py-2">
              Назад
            </Link>
          ) : null}
          <span className="text-ink-500">
            {page} / {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={linkFor({ page: String(page + 1) })} className="rounded-lg border border-ink-200 bg-white px-3 py-2">
              Вперёд
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
