import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { brandOptions, categoryOptions, loadProductForm } from "@/lib/admin/product-form";

export const metadata = { title: "Товар" };

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, brands, categories] = await Promise.all([
    loadProductForm(productId),
    brandOptions(),
    categoryOptions(),
  ]);
  if (!product) notFound();

  const ruSlug = product.translations.find((t) => t.locale === "ru")?.slug;

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Все товары
      </Link>

      <PageHeader
        title={product.translations[0]?.name || "Товар"}
        description={product.sku ? `Артикул: ${product.sku}` : undefined}
        action={
          ruSlug ? (
            <Link
              href={`/ru/product/${ruSlug}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold transition hover:border-ink-400"
            >
              <ExternalLink className="size-4" aria-hidden />
              На сайте
            </Link>
          ) : null
        }
      />

      <ProductForm initial={product} brands={brands} categories={categories} />
    </>
  );
}
