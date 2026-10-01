import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Категории" };

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      key: true,
      parentId: true,
      image: true,
      isActive: true,
      sortOrder: true,
      translations: { where: { locale: "ru" }, select: { name: true, slug: true } },
      _count: { select: { products: true } },
    },
  });

  const roots = categories.filter((c) => c.parentId === null);
  const ordered = roots.flatMap((root) => [root, ...categories.filter((c) => c.parentId === root.id)]);
  const orphans = categories.filter((c) => !ordered.includes(c));

  return (
    <>
      <PageHeader
        title="Категории"
        description={`Всего: ${categories.length}`}
        action={
          <Link href="/admin/categories/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden />
            Добавить категорию
          </Link>
        }
      />

      {categories.length === 0 ? (
        <EmptyState title="Категорий пока нет" />
      ) : (
        <Table
          head={
            <>
              <th className="w-16" />
              <th>Название</th>
              <th>Ключ</th>
              <th>Товаров</th>
              <th>Порядок</th>
              <th>Статус</th>
            </>
          }
        >
          {[...ordered, ...orphans].map((category) => (
            <tr key={category.id}>
              <td>
                <div className="relative size-11 overflow-hidden rounded border border-ink-100 bg-ink-50">
                  {category.image ? (
                    <Image src={category.image} alt="" fill sizes="44px" className="object-cover" />
                  ) : null}
                </div>
              </td>
              <td>
                <Link
                  href={`/admin/categories/${category.id}`}
                  className={`font-semibold text-brand-600 hover:underline ${category.parentId ? "pl-4" : ""}`}
                >
                  {category.parentId ? "— " : ""}
                  {category.translations[0]?.name ?? category.key}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-500">{category.key}</td>
              <td className="text-ink-600">{category._count.products}</td>
              <td className="text-ink-600">{category.sortOrder}</td>
              <td>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                    category.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {category.isActive ? "активна" : "скрыта"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
