import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { locales, routing, type Locale } from "@/i18n/routing";

const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/**
 * Translates the current URL into another language.
 *
 * Product, category, page and post slugs are localised, so a client-side locale
 * swap would break every deep link. This resolves the sibling translation by id
 * and 307s to it, falling back to the section root when no translation exists.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const to = searchParams.get("to") ?? "";
  const rawPath = searchParams.get("path") ?? "/";

  const target: Locale = isLocale(to) ? to : routing.defaultLocale;

  // "/ru/product/ferro-f-86" → ["product", "ferro-f-86"]
  const segments = rawPath.split("?")[0].split("/").filter(Boolean);
  const from = segments[0] && isLocale(segments[0]) ? (segments[0] as Locale) : routing.defaultLocale;
  const rest = segments[0] && isLocale(segments[0]) ? segments.slice(1) : segments;

  const translated = await translatePath(rest, from, target);
  const url = new URL(`/${target}${translated}`, request.nextUrl.origin);
  // Preserve filters and pagination across the switch.
  for (const [key, value] of searchParams) {
    if (key !== "to" && key !== "path") url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url, 307);
}

async function translatePath(rest: string[], from: Locale, to: Locale): Promise<string> {
  if (rest.length === 0) return "";
  const [section, slug] = rest;
  if (!slug) return `/${rest.join("/")}`;

  try {
    if (section === "product") {
      const current = await db.productTranslation.findUnique({
        where: { locale_slug: { locale: from, slug } },
        select: { productId: true },
      });
      if (!current) return "/catalog";
      const next = await db.productTranslation.findUnique({
        where: { productId_locale: { productId: current.productId, locale: to } },
        select: { slug: true },
      });
      return next ? `/product/${next.slug}` : "/catalog";
    }

    if (section === "catalog") {
      const current = await db.categoryTranslation.findUnique({
        where: { locale_slug: { locale: from, slug } },
        select: { categoryId: true },
      });
      if (!current) return "/catalog";
      const next = await db.categoryTranslation.findUnique({
        where: { categoryId_locale: { categoryId: current.categoryId, locale: to } },
        select: { slug: true },
      });
      return next ? `/catalog/${next.slug}` : "/catalog";
    }

    if (section === "info") {
      const current = await db.pageTranslation.findUnique({
        where: { locale_slug: { locale: from, slug } },
        select: { pageId: true },
      });
      if (!current) return "";
      const next = await db.pageTranslation.findUnique({
        where: { pageId_locale: { pageId: current.pageId, locale: to } },
        select: { slug: true },
      });
      return next ? `/info/${next.slug}` : "";
    }

    if (section === "blog") {
      const current = await db.postTranslation.findUnique({
        where: { locale_slug: { locale: from, slug } },
        select: { postId: true },
      });
      if (!current) return "/blog";
      const next = await db.postTranslation.findUnique({
        where: { postId_locale: { postId: current.postId, locale: to } },
        select: { slug: true },
      });
      return next ? `/blog/${next.slug}` : "/blog";
    }
  } catch {
    // A DB hiccup must not trap the visitor on the current language.
    return "";
  }

  return `/${rest.join("/")}`;
}
