import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { locales } from "@/i18n/routing";
import { PageHeader } from "@/components/admin/ui";
import { SlideForm, type SlideFormValue } from "@/components/admin/SlideForm";

export const metadata = { title: "Слайд" };

export default async function AdminSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slideId = Number(id);
  if (!Number.isInteger(slideId)) notFound();

  const slide = await db.slide.findUnique({ where: { id: slideId }, include: { translations: true } });
  if (!slide) notFound();

  const initial: SlideFormValue = {
    id: slide.id,
    image: slide.image,
    mobileImage: slide.mobileImage ?? "",
    link: slide.link ?? "",
    sortOrder: slide.sortOrder,
    isActive: slide.isActive,
    translations: locales.map((locale) => {
      const t = slide.translations.find((x) => x.locale === locale);
      return {
        locale,
        title: t?.title ?? "",
        subtitle: t?.subtitle ?? "",
        buttonText: t?.buttonText ?? "",
      };
    }),
  };

  return (
    <>
      <Link
        href="/admin/slides"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все слайды
      </Link>
      <PageHeader title={initial.translations[0]?.title || `Слайд #${slide.id}`} />
      <SlideForm initial={initial} />
    </>
  );
}
