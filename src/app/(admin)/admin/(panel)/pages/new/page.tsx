import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ContentForm } from "@/components/admin/ContentForm";
import { blankContent } from "@/lib/admin/blanks";

export const metadata = { title: "Новая страница" };

export default function AdminNewPage() {
  return (
    <>
      <Link
        href="/admin/pages"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все страницы
      </Link>
      <PageHeader title="Новая страница" />
      <ContentForm kind="page" initial={blankContent()} />
    </>
  );
}
