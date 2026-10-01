import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-extrabold md:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-ink-200 bg-white ${className}`}>{children}</div>
  );
}

export function Stat({
  label,
  value,
  href,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  href?: string;
  accent?: boolean;
}) {
  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold ${accent ? "text-brand-600" : "text-ink-900"}`}>
        {value}
      </p>
    </>
  );

  return href ? (
    <Link href={href} className="rounded-xl border border-ink-200 bg-white p-5 transition hover:border-ink-400">
      {body}
    </Link>
  ) : (
    <div className="rounded-xl border border-ink-200 bg-white p-5">{body}</div>
  );
}

const STATUS_TONES: Record<string, string> = {
  NEW: "bg-brand-50 text-brand-700",
  CONFIRMED: "bg-sky-50 text-sky-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-ink-100 text-ink-600",
  REFUNDED: "bg-ink-100 text-ink-600",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  DONE: "bg-emerald-50 text-emerald-700",
  SPAM: "bg-ink-100 text-ink-500",
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-brand-50 text-brand-700",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
        STATUS_TONES[status] ?? "bg-ink-100 text-ink-600"
      }`}
    >
      {label ?? status}
    </span>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-300 px-6 py-14 text-center">
      <p className="font-semibold text-ink-700">{title}</p>
      {text ? <p className="mt-1.5 text-sm text-ink-500">{text}</p> : null}
    </div>
  );
}

/** Shared table chrome so every list screen looks the same. */
export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="w-full min-w-160 border-collapse text-sm">
        <thead className="border-b border-ink-200 bg-ink-50/60 text-left">
          <tr className="[&>th]:whitespace-nowrap [&>th]:px-4 [&>th]:py-3 [&>th]:text-xs [&>th]:font-bold [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-ink-500">
            {head}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 [&>tr>td]:px-4 [&>tr>td]:py-3 [&>tr:hover]:bg-ink-50/50">
          {children}
        </tbody>
      </table>
    </div>
  );
}
