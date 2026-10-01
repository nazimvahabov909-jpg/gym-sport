import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { blankProduct, brandOptions, categoryOptions } from "@/lib/admin/product-form";

export const metadata = { title: "Новый товар" };

export default async function AdminNewProductPage() {
  const [brands, categories] = await Promise.all([brandOptions(), categoryOptions()]);

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все товары
      </Link>
      <PageHeader title="Новый товар" description="Заполните название на всех четырёх языках" />
      <ProductForm initial={blankProduct()} brands={brands} categories={categories} />
    </>
  );
}
