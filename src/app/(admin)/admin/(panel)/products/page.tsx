import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { EmptyState, PageHeader, StatusBadge, Table } from "@/components/admin/ui";
import { STOCK_STATUS_LABELS } from "@/lib/admin/labels";
import { ProductActiveToggle } from "@/components/admin/ProductActiveToggle";
import { buttonClass } from "@/components/ui/Button";
import type { Prisma } from "@/generated/prisma/client";

export const metadata = { title: "Товары" };

const PER_PAGE = 40;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string; state?: string }>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const categoryId = Number(sp.category) || undefined;

  const where: Prisma.ProductWhereInput = {
    ...(sp.state === "hidden" ? { isActive: false } : {}),
    ...(sp.state === "active" ? { isActive: true } : {}),
    ...(categoryId ? { categories: { some: { categoryId } } } : {}),
    ...(query
      ? {
          OR: [
            { sku: { contains: query } },
            { translations: { some: { name: { contains: query } } } },
          ],
        }
      : {}),
  };

  const [settings, products, total, categories] = await Promise.all([
    getSettings(),
    db.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        sku: true,
        price: true,
        priceOnRequest: true,
        isActive: true,
        stockStatus: true,
        brand: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        translations: { where: { locale: "ru" }, select: { name: true } },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, parentId: true, key: true, translations: { where: { locale: "ru" }, select: { name: true } } },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const link = (next: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged = { q: query || undefined, category: sp.category, state: sp.state, ...next };
    for (const [key, value] of Object.entries(merged)) if (value) qs.set(key, String(value));
    const s = qs.toString();
    return s ? `/admin/products?${s}` : "/admin/products";
  };

  return (
    <>
      <PageHeader
        title="Товары"
        description={`Всего: ${total}`}
        action={
          <Link href="/admin/products/new" className={buttonClass("primary", "md")}>
            <Plus className="size-4" aria-hidden />
            Добавить товар
          </Link>
        }
      />

      <form action="/admin/products" className="mb-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Название или артикул"
          className="h-9 w-full max-w-xs rounded-lg border border-ink-200 px-3 text-sm outline-none transition focus:border-brand-500"
        />
        <select
          name="category"
          defaultValue={sp.category ?? ""}
          className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none"
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentId ? "— " : ""}
              {c.translations[0]?.name ?? c.key}
            </option>
          ))}
        </select>
        <select
          name="state"
          defaultValue={sp.state ?? ""}
          className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none"
        >
          <option value="">Все</option>
          <option value="active">Активные</option>
          <option value="hidden">Скрытые</option>
        </select>
        <button type="submit" className="h-9 rounded-lg bg-ink-900 px-4 text-sm font-semibold text-white">
          Найти
        </button>
      </form>

      {products.length === 0 ? (
        <EmptyState title="Товары не найдены" text="Измените фильтры или добавьте новый товар" />
      ) : (
        <Table
          head={
            <>
              <th className="w-16" />
              <th>Название</th>
              <th>Бренд</th>
              <th>Наличие</th>
              <th className="text-right">Цена</th>
              <th className="text-right">Показ</th>
            </>
          }
        >
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="relative size-11 overflow-hidden rounded border border-ink-100 bg-ink-50">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-contain p-0.5"
                    />
                  ) : null}
                </div>
              </td>
              <td>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  {product.translations[0]?.name ?? `#${product.id}`}
                </Link>
                {product.sku ? <p className="text-xs text-ink-400">{product.sku}</p> : null}
              </td>
              <td className="text-ink-600">{product.brand?.name ?? "—"}</td>
              <td>
                <StatusBadge
                  status={product.stockStatus === "IN_STOCK" ? "DELIVERED" : "CANCELLED"}
                  label={STOCK_STATUS_LABELS[product.stockStatus]}
                />
              </td>
              <td className="whitespace-nowrap text-right font-bold">
                {product.priceOnRequest ? (
                  <span className="text-navy-800">по запросу</span>
                ) : (
                  formatMoney(product.price, "ru", settings.currency)
                )}
              </td>
              <td className="text-right">
                <ProductActiveToggle productId={product.id} isActive={product.isActive} />
              </td>
            </tr>
          ))}
        </Table>
      )}

      {pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Link href={link({ page: String(page - 1) })} className="rounded-lg border border-ink-200 bg-white px-3 py-2">
              Назад
            </Link>
          ) : null}
          <span className="text-ink-500">
            {page} / {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={link({ page: String(page + 1) })} className="rounded-lg border border-ink-200 bg-white px-3 py-2">
              Вперёд
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
