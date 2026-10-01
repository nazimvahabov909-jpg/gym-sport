import "server-only";
import { db } from "@/lib/db";
import { locales } from "@/i18n/routing";
import type { ContentFormValue } from "@/components/admin/ContentForm";

export async function loadPageForm(pageId: number): Promise<ContentFormValue | null> {
  const page = await db.page.findUnique({ where: { id: pageId }, include: { translations: true } });
  if (!page) return null;

  return {
    id: page.id,
    key: page.key,
    image: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    isActive: page.isActive,
    sortOrder: page.sortOrder,
    translations: locales.map((locale) => {
      const t = page.translations.find((x) => x.locale === locale);
      return {
        locale,
        title: t?.title ?? "",
        slug: t?.slug ?? "",
        excerpt: "",
        content: t?.content ?? "",
        metaTitle: t?.metaTitle ?? "",
        metaDescription: t?.metaDescription ?? "",
      };
    }),
  };
}

export async function loadPostForm(postId: number): Promise<ContentFormValue | null> {
  const post = await db.post.findUnique({ where: { id: postId }, include: { translations: true } });
  if (!post) return null;

  return {
    id: post.id,
    key: "",
    image: post.image ?? "",
    publishedAt: post.publishedAt.toISOString().slice(0, 10),
    isActive: post.isActive,
    sortOrder: 0,
    translations: locales.map((locale) => {
      const t = post.translations.find((x) => x.locale === locale);
      return {
        locale,
        title: t?.title ?? "",
        slug: t?.slug ?? "",
        excerpt: t?.excerpt ?? "",
        content: t?.content ?? "",
        metaTitle: t?.metaTitle ?? "",
        metaDescription: t?.metaDescription ?? "",
      };
    }),
  };
}
