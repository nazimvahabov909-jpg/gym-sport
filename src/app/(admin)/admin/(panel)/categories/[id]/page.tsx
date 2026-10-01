import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { locales, type Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm, type CategoryFormValue } from "@/components/admin/CategoryForm";

export const metadata = { title: "Категория" };

export default async function AdminCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId)) notFound();

  const [category, all] = await Promise.all([
    db.category.findUnique({ where: { id: categoryId }, include: { translations: true } }),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, key: true, translations: { where: { locale: "ru" }, select: { name: true } } },
    }),
  ]);
  if (!category) notFound();

  const initial: CategoryFormValue = {
    id: category.id,
    key: category.key,
    parentId: category.parentId,
    image: category.image ?? "",
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    showInMenu: category.showInMenu,
    translations: locales.map((locale: Locale) => {
      const t = category.translations.find((x) => x.locale === locale);
      return {
        locale,
        name: t?.name ?? "",
        slug: t?.slug ?? "",
        description: t?.description ?? "",
        metaTitle: t?.metaTitle ?? "",
        metaDescription: t?.metaDescription ?? "",
      };
    }),
  };

  return (
    <>
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все категории
      </Link>
      <PageHeader title={initial.translations[0]?.name || category.key} />
      <CategoryForm
        initial={initial}
        parents={all.map((c) => ({ id: c.id, label: c.translations[0]?.name ?? c.key }))}
      />
    </>
  );
}
