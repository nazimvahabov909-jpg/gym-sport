import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Слайдер" };

export default async function AdminSlidesPage() {
  const slides = await db.slide.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: { where: { locale: "ru" }, select: { title: true } } },
  });

  return (
    <>
      <PageHeader
        title="Слайдер на главной"
        description={`Слайдов: ${slides.length}`}
        action={
          <Link href="/admin/slides/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden />
            Добавить слайд
          </Link>
        }
      />

      {slides.length === 0 ? (
        <EmptyState title="Слайдов пока нет" />
      ) : (
        <Table
          head={
            <>
              <th className="w-32" />
              <th>Заголовок</th>
              <th>Ссылка</th>
              <th>Порядок</th>
              <th>Статус</th>
            </>
          }
        >
          {slides.map((slide) => (
            <tr key={slide.id}>
              <td>
                <div className="relative h-14 w-28 overflow-hidden rounded border border-ink-100 bg-ink-50">
                  {slide.image ? (
                    <Image src={slide.image} alt="" fill sizes="112px" className="object-cover" />
                  ) : null}
                </div>
              </td>
              <td>
                <Link href={`/admin/slides/${slide.id}`} className="font-semibold text-brand-600 hover:underline">
                  {slide.translations[0]?.title || `Слайд #${slide.id}`}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-500">{slide.link ?? "—"}</td>
              <td className="text-ink-600">{slide.sortOrder}</td>
              <td>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                    slide.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {slide.isActive ? "активен" : "скрыт"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
