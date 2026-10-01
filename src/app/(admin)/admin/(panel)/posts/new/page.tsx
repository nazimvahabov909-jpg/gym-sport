import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ContentForm } from "@/components/admin/ContentForm";
import { blankContent } from "@/lib/admin/blanks";

export const metadata = { title: "Новая статья" };

export default function AdminNewPostPage() {
  return (
    <>
      <Link
        href="/admin/posts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все статьи
      </Link>
      <PageHeader title="Новая статья" />
      <ContentForm kind="post" initial={blankContent()} />
    </>
  );
}
