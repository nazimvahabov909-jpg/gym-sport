import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Страницы" };

export default async function AdminPagesPage() {
  const pages = await db.page.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: { where: { locale: "ru" }, select: { title: true, slug: true } } },
  });

  return (
    <>
      <PageHeader
        title="Страницы"
        description="Информационные страницы в подвале сайта"
        action={
          <Link href="/admin/pages/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden />
            Добавить страницу
          </Link>
        }
      />

      {pages.length === 0 ? (
        <EmptyState title="Страниц пока нет" />
      ) : (
        <Table
          head={
            <>
              <th>Заголовок</th>
              <th>Ключ</th>
              <th>URL (ru)</th>
              <th>Порядок</th>
              <th>Статус</th>
            </>
          }
        >
          {pages.map((page) => (
            <tr key={page.id}>
              <td>
                <Link href={`/admin/pages/${page.id}`} className="font-semibold text-brand-600 hover:underline">
                  {page.translations[0]?.title ?? page.key}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-500">{page.key}</td>
              <td className="font-mono text-xs text-ink-500">{page.translations[0]?.slug ?? "—"}</td>
              <td className="text-ink-600">{page.sortOrder}</td>
              <td>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                    page.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {page.isActive ? "опубликована" : "черновик"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
