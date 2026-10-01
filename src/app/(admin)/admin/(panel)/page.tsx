import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { Card, EmptyState, PageHeader, Stat, StatusBadge, Table } from "@/components/admin/ui";
import { ORDER_STATUS_LABELS, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/admin/labels";

export const metadata = { title: "Обзор" };

export default async function AdminDashboard() {
  const [settings, counts, recentOrders, recentLeads] = await Promise.all([
    getSettings(),
    Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "NEW" } }),
      db.lead.count({ where: { status: "NEW" } }),
      db.product.count({ where: { isActive: true } }),
      db.customer.count(),
    ]),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        total: true,
        needsQuote: true,
        createdAt: true,
      },
    }),
    db.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, phone: true, type: true, status: true, createdAt: true },
    }),
  ]);

  const [totalOrders, newOrders, newLeads, activeProducts, customers] = counts;

  return (
    <>
      <PageHeader title="Обзор" description="Что происходит в магазине прямо сейчас" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Новые заказы" value={newOrders} href="/admin/orders?status=NEW" accent={newOrders > 0} />
        <Stat label="Новые заявки" value={newLeads} href="/admin/leads?status=NEW" accent={newLeads > 0} />
        <Stat label="Всего заказов" value={totalOrders} href="/admin/orders" />
        <Stat label="Активных товаров" value={activeProducts} href="/admin/products" />
        <Stat label="Клиентов" value={customers} href="/admin/customers" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
              Последние заказы
            </h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-600 hover:underline">
              Все заказы
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState title="Заказов пока нет" />
          ) : (
            <Table
              head={
                <>
                  <th>Номер</th>
                  <th>Клиент</th>
                  <th>Статус</th>
                  <th className="text-right">Сумма</th>
                </>
              }
            >
              {recentOrders.map((order) => (
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
                    <p className="text-xs text-ink-400">{order.phone}</p>
                  </td>
                  <td>
                    <StatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
                  </td>
                  <td className="text-right font-bold">
                    {order.needsQuote ? "—" : formatMoney(order.total, "ru", settings.currency)}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
              Последние заявки
            </h2>
            <Link href="/admin/leads" className="text-xs font-semibold text-brand-600 hover:underline">
              Все заявки
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <EmptyState title="Заявок пока нет" />
          ) : (
            <Card>
              <ul className="divide-y divide-ink-100">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{lead.name}</p>
                      <p className="text-xs text-ink-400">
                        {lead.phone} · {LEAD_TYPE_LABELS[lead.type]} · {formatDateTime(lead.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} label={LEAD_STATUS_LABELS[lead.status]} />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
