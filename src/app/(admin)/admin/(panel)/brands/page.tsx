import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Бренды" };

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      isActive: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Бренды"
        description={`Всего: ${brands.length}`}
        action={
          <Link href="/admin/brands/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden />
            Добавить бренд
          </Link>
        }
      />

      {brands.length === 0 ? (
        <EmptyState title="Брендов пока нет" />
      ) : (
        <Table
          head={
            <>
              <th className="w-20" />
              <th>Название</th>
              <th>URL</th>
              <th>Товаров</th>
              <th>Статус</th>
            </>
          }
        >
          {brands.map((brand) => (
            <tr key={brand.id}>
              <td>
                <div className="relative h-10 w-16 overflow-hidden rounded border border-ink-100 bg-white">
                  {brand.logo ? (
                    <Image src={brand.logo} alt="" fill sizes="64px" className="object-contain p-1" />
                  ) : null}
                </div>
              </td>
              <td>
                <Link href={`/admin/brands/${brand.id}`} className="font-semibold text-brand-600 hover:underline">
                  {brand.name}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-500">{brand.slug}</td>
              <td className="text-ink-600">{brand._count.products}</td>
              <td>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                    brand.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {brand.isActive ? "активен" : "скрыт"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
