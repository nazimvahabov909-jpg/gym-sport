import { cache } from "react";
import { db } from "@/lib/db";
import type { Locale } from "@/i18n/routing";

export const getSlides = cache(async (locale: Locale) => {
  const rows = await db.slide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { translations: { where: { locale } } },
  });
  return rows.map((row) => ({
    id: row.id,
    image: row.image,
    link: row.link,
    title: row.translations[0]?.title ?? null,
    subtitle: row.translations[0]?.subtitle ?? null,
    buttonText: row.translations[0]?.buttonText ?? null,
  }));
});

export const getPosts = cache(async (locale: Locale, take?: number) => {
  const rows = await db.post.findMany({
    where: { isActive: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take,
    include: { translations: { where: { locale } } },
  });
  return rows
    .filter((row) => row.translations.length > 0)
    .map((row) => ({
      id: row.id,
      image: row.image,
      publishedAt: row.publishedAt,
      title: row.translations[0].title,
      slug: row.translations[0].slug,
      excerpt: row.translations[0].excerpt,
    }));
});

export const getPostBySlug = cache(async (locale: Locale, slug: string) => {
  const row = await db.postTranslation.findUnique({
    where: { locale_slug: { locale, slug } },
    include: { post: true },
  });
  if (!row || !row.post.isActive) return null;
  return row;
});

export const getPageBySlug = cache(async (locale: Locale, slug: string) => {
  const row = await db.pageTranslation.findUnique({
    where: { locale_slug: { locale, slug } },
    include: { page: true },
  });
  if (!row || !row.page.isActive) return null;
  return row;
});

export const getPageByKey = cache(async (locale: Locale, key: string) => {
  const page = await db.page.findUnique({
    where: { key },
    include: { translations: { where: { locale } } },
  });
  if (!page?.isActive || page.translations.length === 0) return null;
  return page.translations[0];
});

export const getPostSlugsByLocale = cache(async (postId: number) => {
  const rows = await db.postTranslation.findMany({ where: { postId }, select: { locale: true, slug: true } });
  return Object.fromEntries(rows.map((r) => [r.locale, r.slug])) as Partial<Record<Locale, string>>;
});

export const getPageSlugsByLocale = cache(async (pageId: number) => {
  const rows = await db.pageTranslation.findMany({ where: { pageId }, select: { locale: true, slug: true } });
  return Object.fromEntries(rows.map((r) => [r.locale, r.slug])) as Partial<Record<Locale, string>>;
});
