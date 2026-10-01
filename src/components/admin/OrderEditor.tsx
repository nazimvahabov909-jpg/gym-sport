"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { updateOrderStatus, updateOrderTotals } from "@/app/actions/admin";
import { formatMoney } from "@/lib/format";
import { buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/admin/fields";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

type Item = {
  id: number;
  name: string;
  sku: string | null;
  image: string | null;
  quantity: number;
  price: number;
};

export function OrderEditor({
  orderId,
  currency,
  items: initialItems,
  shippingCost: initialShipping,
  discount: initialDiscount,
  status: initialStatus,
  paymentStatus: initialPaymentStatus,
  statusLabels,
  paymentStatusLabels,
}: {
  orderId: number;
  currency: string;
  items: Item[];
  shippingCost: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  statusLabels: Record<OrderStatus, string>;
  paymentStatusLabels: Record<PaymentStatus, string>;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [shipping, setShipping] = useState(initialShipping);
  const [discount, setDiscount] = useState(initialDiscount);
  const [status, setStatus] = useState(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal + shipping - discount);
  const money = (value: number) => formatMoney(value, "ru", currency);

  function save() {
    setMessage(null);
    startTransition(async () => {
      const totals = await updateOrderTotals({
        orderId,
        items: items.map((i) => ({ id: i.id, price: i.price })),
        shippingCost: shipping,
        discount,
      });
      if (!totals.ok) {
        setMessage({ tone: "bad", text: totals.error });
        return;
      }

      const statusResult = await updateOrderStatus({
        orderId,
        status,
        paymentStatus,
        note: note.trim() || undefined,
      });
      if (!statusResult.ok) {
        setMessage({ tone: "bad", text: statusResult.error });
        return;
      }

      setNote("");
      setMessage({ tone: "ok", text: "Сохранено" });
      router.refresh();
    });
  }

  return (
    <div className="mt-4">
      <ul className="divide-y divide-ink-100 border-y border-ink-100">
        {items.map((item, index) => (
          <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded border border-ink-100 bg-ink-50">
              {item.image ? (
                <Image src={item.image} alt="" fill sizes="48px" className="object-contain p-0.5" />
              ) : null}
            </div>
            <div className="min-w-40 flex-1">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-ink-400">
                {item.sku ?? "—"} · {item.quantity} шт.
              </p>
            </div>
            <label className="flex items-center gap-2">
              <span className="text-xs text-ink-500">Цена</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.price}
                onChange={(e) => {
                  const price = Math.max(0, Number(e.target.value) || 0);
                  setItems((prev) => prev.map((it, i) => (i === index ? { ...it, price } : it)));
                }}
                className={`${inputClass} w-32`}
              />
            </label>
            <p className="min-w-28 text-right text-sm font-bold">{money(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-600">Доставка</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={shipping}
            onChange={(e) => setShipping(Math.max(0, Number(e.target.value) || 0))}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-600">Скидка</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-600">Статус заказа</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className={inputClass}
          >
            {(Object.keys(statusLabels) as OrderStatus[]).map((value) => (
              <option key={value} value={value}>
                {statusLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-ink-600">Статус оплаты</span>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className={inputClass}
          >
            {(Object.keys(paymentStatusLabels) as PaymentStatus[]).map((value) => (
              <option key={value} value={value}>
                {paymentStatusLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-ink-600">
            Комментарий к смене статуса
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Необязательно"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-4">
        <p className="text-sm">
          Итого: <span className="text-lg font-extrabold">{money(total)}</span>
        </p>
        <div className="flex items-center gap-3">
          {message ? (
            <span
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                message.tone === "ok" ? "text-emerald-600" : "text-brand-600"
              }`}
            >
              {message.tone === "ok" ? <Check className="size-4" aria-hidden /> : null}
              {message.text}
            </span>
          ) : null}
          <button type="button" onClick={save} disabled={pending} className={buttonClass("primary", "md")}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
