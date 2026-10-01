import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { formatDateTime, formatMoney, toNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/admin/labels";
import { OrderEditor } from "@/components/admin/OrderEditor";

export const metadata = { title: "Заказ" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const [settings, order] = await Promise.all([
    getSettings(),
    db.order.findUnique({
      where: { id: orderId },
      include: {
        items: { orderBy: { id: "asc" } },
        history: { orderBy: { createdAt: "desc" } },
        customer: { select: { id: true, email: true } },
      },
    }),
  ]);
  if (!order) notFound();

  const money = (value: unknown) => formatMoney(value, "ru", order.currency || settings.currency);

  return (
    <>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все заказы
      </Link>

      <PageHeader
        title={order.orderNumber}
        description={`Создан ${formatDateTime(order.createdAt)}`}
        action={
          <div className="flex gap-2">
            <StatusBadge status={order.status} label={ORDER_STATUS_LABELS[order.status]} />
            <StatusBadge
              status={order.paymentStatus}
              label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
            />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
              Состав заказа
            </h2>

            <OrderEditor
              orderId={order.id}
              currency={order.currency || settings.currency}
              items={order.items.map((item) => ({
                id: item.id,
                name: item.name,
                sku: item.sku,
                image: item.image,
                quantity: item.quantity,
                price: toNumber(item.price),
              }))}
              shippingCost={toNumber(order.shippingCost)}
              discount={toNumber(order.discount)}
              status={order.status}
              paymentStatus={order.paymentStatus}
              statusLabels={ORDER_STATUS_LABELS}
              paymentStatusLabels={PAYMENT_STATUS_LABELS}
            />
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
              История статусов
            </h2>
            <ul className="mt-4 space-y-3">
              {order.history.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-3 text-sm">
                  <StatusBadge status={entry.status} label={ORDER_STATUS_LABELS[entry.status]} />
                  <span className="text-xs text-ink-400">{formatDateTime(entry.createdAt)}</span>
                  {entry.note ? <span className="text-ink-600">{entry.note}</span> : null}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
              Клиент
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-ink-400">Имя</dt>
                <dd className="font-medium">
                  {order.firstName} {order.lastName ?? ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-400">Телефон</dt>
                <dd>
                  <a
                    href={`tel:${order.phone.replace(/[^+\d]/g, "")}`}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    {order.phone}
                  </a>
                </dd>
              </div>
              {order.email ? (
                <div>
                  <dt className="text-xs text-ink-400">E-mail</dt>
                  <dd>
                    <a href={`mailto:${order.email}`} className="font-medium text-brand-600 hover:underline">
                      {order.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {order.city || order.addressLine ? (
                <div>
                  <dt className="text-xs text-ink-400">Доставка</dt>
                  <dd className="font-medium">
                    {[order.city, order.addressLine].filter(Boolean).join(", ")}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-ink-400">Оплата</dt>
                <dd className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-400">Язык заказа</dt>
                <dd className="font-medium uppercase">{order.locale}</dd>
              </div>
              {order.customer ? (
                <div>
                  <dt className="text-xs text-ink-400">Аккаунт</dt>
                  <dd className="font-medium">{order.customer.email}</dd>
                </div>
              ) : null}
            </dl>

            {order.comment ? (
              <div className="mt-4 rounded-lg bg-ink-50 p-3">
                <p className="text-xs font-semibold text-ink-500">Комментарий</p>
                <p className="mt-1 text-sm text-ink-700">{order.comment}</p>
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">Итоги</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Товары</dt>
                <dd className="font-semibold">{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Доставка</dt>
                <dd className="font-semibold">{money(order.shippingCost)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Скидка</dt>
                <dd className="font-semibold">−{money(order.discount)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-2 text-base">
                <dt className="font-bold">Итого</dt>
                <dd className="font-extrabold">{money(order.total)}</dd>
              </div>
            </dl>
            {order.needsQuote ? (
              <p className="mt-3 rounded-lg bg-navy-50 p-3 text-xs text-navy-800">
                В заказе есть позиции без цены. Проставьте цены слева и сохраните — итог пересчитается.
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
              Позиции
            </h2>
            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded border border-ink-100 bg-ink-50">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="48px" className="object-contain p-0.5" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="clamp-2 text-xs font-semibold">{item.name}</p>
                    <p className="text-[11px] text-ink-400">
                      {item.sku ? `${item.sku} · ` : ""}× {item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
