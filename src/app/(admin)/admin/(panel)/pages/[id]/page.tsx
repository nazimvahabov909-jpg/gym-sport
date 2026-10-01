import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ContentForm } from "@/components/admin/ContentForm";
import { loadPageForm } from "@/lib/admin/content-form";

export const metadata = { title: "Страница" };

export default async function AdminPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pageId = Number(id);
  if (!Number.isInteger(pageId)) notFound();

  const page = await loadPageForm(pageId);
  if (!page) notFound();

  return (
    <>
      <Link
        href="/admin/pages"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все страницы
      </Link>
      <PageHeader title={page.translations[0]?.title || page.key} />
      <ContentForm kind="page" initial={page} />
    </>
  );
}
