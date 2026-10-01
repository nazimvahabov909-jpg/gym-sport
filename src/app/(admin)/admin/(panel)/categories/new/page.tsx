import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { blankCategory } from "@/lib/admin/blanks";

export const metadata = { title: "Новая категория" };

export default async function AdminNewCategoryPage() {
  const parents = await db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, key: true, translations: { where: { locale: "ru" }, select: { name: true } } },
  });

  return (
    <>
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все категории
      </Link>
      <PageHeader title="Новая категория" />
      <CategoryForm
        initial={blankCategory()}
        parents={parents.map((c) => ({ id: c.id, label: c.translations[0]?.name ?? c.key }))}
      />
    </>
  );
}
