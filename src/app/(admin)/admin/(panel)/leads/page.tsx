import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/admin/labels";
import { LeadRowActions } from "@/components/admin/LeadRowActions";
import type { LeadStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Заявки" };

const STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as LeadStatus) ? (sp.status as LeadStatus) : undefined;

  const leads = await db.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      product: { select: { id: true, translations: { where: { locale: "ru" }, select: { name: true, slug: true } } } },
    },
  });

  return (
    <>
      <PageHeader title="Заявки" description="Запросы цены, обратные звонки и сообщения с сайта" />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href="/admin/leads"
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            !status ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-ink-400"
          }`}
        >
          Все
        </Link>
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/leads?status=${value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              status === value
                ? "bg-ink-900 text-white"
                : "bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-ink-400"
            }`}
          >
            {LEAD_STATUS_LABELS[value]}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <EmptyState title="Заявок не найдено" />
      ) : (
        <Table
          head={
            <>
              <th>Контакт</th>
              <th>Тип</th>
              <th>Товар / сообщение</th>
              <th>Статус</th>
              <th />
            </>
          }
        >
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <p className="font-medium">{lead.name}</p>
                <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`} className="text-xs text-brand-600 hover:underline">
                  {lead.phone}
                </a>
                <p className="mt-0.5 text-xs text-ink-400">{formatDateTime(lead.createdAt)}</p>
              </td>
              <td className="whitespace-nowrap text-ink-600">{LEAD_TYPE_LABELS[lead.type]}</td>
              <td className="max-w-80">
                {lead.product ? (
                  <Link
                    href={`/admin/products/${lead.product.id}`}
                    className="text-sm font-semibold text-brand-600 hover:underline"
                  >
                    {lead.product.translations[0]?.name ?? `#${lead.product.id}`}
                  </Link>
                ) : null}
                {lead.message ? (
                  <p className="clamp-2 text-xs text-ink-500">{lead.message}</p>
                ) : null}
              </td>
              <td>
                <LeadRowActions
                  leadId={lead.id}
                  status={lead.status}
                  labels={LEAD_STATUS_LABELS}
                  mode="status"
                />
              </td>
              <td className="text-right">
                <LeadRowActions leadId={lead.id} status={lead.status} labels={LEAD_STATUS_LABELS} mode="delete" />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
