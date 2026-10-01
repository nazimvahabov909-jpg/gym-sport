import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ContentForm } from "@/components/admin/ContentForm";
import { loadPostForm } from "@/lib/admin/content-form";

export const metadata = { title: "Статья" };

export default async function AdminPostEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const post = await loadPostForm(postId);
  if (!post) notFound();

  return (
    <>
      <Link
        href="/admin/posts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все статьи
      </Link>
      <PageHeader title={post.translations[0]?.title || "Статья"} />
      <ContentForm kind="post" initial={post} />
    </>
  );
}
