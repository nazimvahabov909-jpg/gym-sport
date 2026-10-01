import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Блог" };

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({
    orderBy: { publishedAt: "desc" },
    include: { translations: { where: { locale: "ru" }, select: { title: true, slug: true } } },
  });

  return (
    <>
      <PageHeader
        title="Блог"
        description={`Всего статей: ${posts.length}`}
        action={
          <Link href="/admin/posts/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden />
            Новая статья
          </Link>
        }
      />

      {posts.length === 0 ? (
        <EmptyState title="Статей пока нет" />
      ) : (
        <Table
          head={
            <>
              <th className="w-20" />
              <th>Заголовок</th>
              <th>URL (ru)</th>
              <th>Публикация</th>
              <th>Статус</th>
            </>
          }
        >
          {posts.map((post) => (
            <tr key={post.id}>
              <td>
                <div className="relative h-10 w-16 overflow-hidden rounded border border-ink-100 bg-ink-50">
                  {post.image ? (
                    <Image src={post.image} alt="" fill sizes="64px" className="object-cover" />
                  ) : null}
                </div>
              </td>
              <td>
                <Link href={`/admin/posts/${post.id}`} className="font-semibold text-brand-600 hover:underline">
                  {post.translations[0]?.title ?? `#${post.id}`}
                </Link>
              </td>
              <td className="font-mono text-xs text-ink-500">{post.translations[0]?.slug ?? "—"}</td>
              <td className="whitespace-nowrap text-xs text-ink-500">
                {formatDateTime(post.publishedAt)}
              </td>
              <td>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                    post.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {post.isActive ? "опубликована" : "черновик"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
