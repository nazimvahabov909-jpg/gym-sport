import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { SlideForm } from "@/components/admin/SlideForm";
import { blankSlide } from "@/lib/admin/blanks";

export const metadata = { title: "Новый слайд" };

export default async function AdminNewSlidePage() {
  const last = await db.slide.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });

  return (
    <>
      <Link
        href="/admin/slides"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все слайды
      </Link>
      <PageHeader title="Новый слайд" />
      <SlideForm initial={blankSlide((last?.sortOrder ?? 0) + 10)} />
    </>
  );
}
