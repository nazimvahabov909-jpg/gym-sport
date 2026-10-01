import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { BrandForm } from "@/components/admin/BrandForm";
import { blankBrand } from "@/lib/admin/blanks";

export const metadata = { title: "Новый бренд" };

export default function AdminNewBrandPage() {
  return (
    <>
      <Link
        href="/admin/brands"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все бренды
      </Link>
      <PageHeader title="Новый бренд" />
      <BrandForm initial={blankBrand()} />
    </>
  );
}
