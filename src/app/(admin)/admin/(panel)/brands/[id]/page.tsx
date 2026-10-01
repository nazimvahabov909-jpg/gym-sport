import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { locales } from "@/i18n/routing";
import { PageHeader } from "@/components/admin/ui";
import { BrandForm, type BrandFormValue } from "@/components/admin/BrandForm";

export const metadata = { title: "Бренд" };

export default async function AdminBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brandId = Number(id);
  if (!Number.isInteger(brandId)) notFound();

  const brand = await db.brand.findUnique({ where: { id: brandId }, include: { translations: true } });
  if (!brand) notFound();

  const initial: BrandFormValue = {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo ?? "",
    website: brand.website ?? "",
    sortOrder: brand.sortOrder,
    isActive: brand.isActive,
    descriptions: locales.map((locale) => ({
      locale,
      description: brand.translations.find((t) => t.locale === locale)?.description ?? "",
    })),
  };

  return (
    <>
      <Link
        href="/admin/brands"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все бренды
      </Link>
      <PageHeader title={brand.name} />
      <BrandForm initial={initial} />
    </>
  );
}
