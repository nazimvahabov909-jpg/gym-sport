"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { locales, type Locale } from "@/i18n/routing";
import { saveProduct, deleteProduct, type ProductInput } from "@/app/actions/admin";
import { LOCALE_LABELS, STOCK_STATUS_LABELS } from "@/lib/admin/labels";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/admin/ui";
import { Checkbox, Field, Input, Select, Textarea, inputClass } from "@/components/admin/fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { GalleryField, type GalleryItem } from "@/components/admin/ImageUploader";
import type { StockStatus } from "@/generated/prisma/enums";

export type ProductFormTranslation = {
  locale: Locale;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
};

export type ProductFormSpec = { locale: Locale; name: string; value: string };

export type ProductFormValue = {
  id?: number;
  sku: string;
  brandId: number | null;
  price: number;
  oldPrice: number | null;
  priceOnRequest: boolean;
  stock: number;
  stockStatus: StockStatus;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  sortOrder: number;
  categoryIds: number[];
  images: GalleryItem[];
  specs: ProductFormSpec[];
  translations: ProductFormTranslation[];
};

export function ProductForm({
  initial,
  brands,
  categories,
}: {
  initial: ProductFormValue;
  brands: { id: number; name: string }[];
  categories: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (next: Partial<ProductFormValue>) => setValue((v) => ({ ...v, ...next }));

  const patchTranslation = (locale: Locale, next: Partial<ProductFormTranslation>) =>
    setValue((v) => ({
      ...v,
      translations: v.translations.map((t) => (t.locale === locale ? { ...t, ...next } : t)),
    }));

  const incomplete = value.translations.filter((t) => !t.name.trim()).map((t) => t.locale);

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const payload: ProductInput = {
        id: value.id,
        sku: value.sku,
        brandId: value.brandId,
        price: value.price,
        oldPrice: value.oldPrice,
        priceOnRequest: value.priceOnRequest,
        stock: value.stock,
        stockStatus: value.stockStatus,
        isActive: value.isActive,
        isFeatured: value.isFeatured,
        isNew: value.isNew,
        sortOrder: value.sortOrder,
        categoryIds: value.categoryIds,
        images: value.images.map((i) => ({ url: i.url, alt: i.alt })),
        specs: value.specs.filter((s) => s.name.trim() && s.value.trim()),
        translations: value.translations,
      };

      const result = await saveProduct(payload);
      if (!result.ok) {
        setMessage({ tone: "bad", text: result.error });
        return;
      }
      setMessage({ tone: "ok", text: "Сохранено" });
      if (!value.id && result.data) {
        router.replace(`/admin/products/${result.data.id}`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
            Тексты
          </h2>
          <div className="mt-4">
            <LocaleTabs
              incomplete={incomplete}
              render={(locale) => {
                const t = value.translations.find((x) => x.locale === locale)!;
                return (
                  <div className="grid gap-4">
                    <Field label={`Название (${LOCALE_LABELS[locale]}) *`}>
                      <Input
                        value={t.name}
                        onChange={(e) => patchTranslation(locale, { name: e.target.value })}
                      />
                    </Field>
                    <Field label="URL (slug)" hint="Оставьте пустым — сгенерируем из названия">
                      <Input
                        value={t.slug}
                        onChange={(e) => patchTranslation(locale, { slug: e.target.value })}
                        placeholder="ferro-f-86"
                      />
                    </Field>
                    <Field label="Краткое описание">
                      <Textarea
                        rows={2}
                        value={t.shortDescription}
                        onChange={(e) => patchTranslation(locale, { shortDescription: e.target.value })}
                      />
                    </Field>
                    <Field label="Описание" hint="Можно использовать HTML: <p>, <h2>, <ul>, <strong>">
                      <Textarea
                        rows={8}
                        value={t.description}
                        onChange={(e) => patchTranslation(locale, { description: e.target.value })}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="SEO title">
                        <Input
                          value={t.metaTitle}
                          onChange={(e) => patchTranslation(locale, { metaTitle: e.target.value })}
                        />
                      </Field>
                      <Field label="SEO description">
                        <Input
                          value={t.metaDescription}
                          onChange={(e) => patchTranslation(locale, { metaDescription: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
              Характеристики
            </h2>
            <button
              type="button"
              onClick={() =>
                patch({ specs: [...value.specs, { locale: "ru", name: "", value: "" }] })
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-xs font-semibold transition hover:border-ink-400"
            >
              <Plus className="size-3.5" aria-hidden />
              Добавить
            </button>
          </div>

          {value.specs.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-xs text-ink-400">
              Характеристики не заданы
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {value.specs.map((spec, index) => (
                <li key={index} className="flex flex-wrap items-center gap-2">
                  <select
                    value={spec.locale}
                    onChange={(e) =>
                      patch({
                        specs: value.specs.map((s, i) =>
                          i === index ? { ...s, locale: e.target.value as Locale } : s,
                        ),
                      })
                    }
                    className={`${inputClass} w-28`}
                  >
                    {locales.map((l) => (
                      <option key={l} value={l}>
                        {l.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <input
                    value={spec.name}
                    placeholder="Параметр"
                    onChange={(e) =>
                      patch({
                        specs: value.specs.map((s, i) =>
                          i === index ? { ...s, name: e.target.value } : s,
                        ),
                      })
                    }
                    className={`${inputClass} min-w-32 flex-1`}
                  />
                  <input
                    value={spec.value}
                    placeholder="Значение"
                    onChange={(e) =>
                      patch({
                        specs: value.specs.map((s, i) =>
                          i === index ? { ...s, value: e.target.value } : s,
                        ),
                      })
                    }
                    className={`${inputClass} min-w-32 flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => patch({ specs: value.specs.filter((_, i) => i !== index) })}
                    aria-label="Удалить"
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <GalleryField items={value.images} onChange={(images) => patch({ images })} />
        </Card>
      </div>

      <aside className="space-y-6">
        <Card className="p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
            Публикация
          </h2>
          <div className="mt-4 space-y-1">
            <Checkbox
              label="Активен"
              checked={value.isActive}
              onChange={(e) => patch({ isActive: e.target.checked })}
            />
            <Checkbox
              label="Рекомендуемый"
              checked={value.isFeatured}
              onChange={(e) => patch({ isFeatured: e.target.checked })}
            />
            <Checkbox
              label="Новинка"
              checked={value.isNew}
              onChange={(e) => patch({ isNew: e.target.checked })}
            />
          </div>
          <Field label="Порядок сортировки" className="mt-4">
            <Input
              type="number"
              value={value.sortOrder}
              onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
            />
          </Field>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
            Цена и наличие
          </h2>
          <div className="mt-4 space-y-4">
            <Checkbox
              label="Цена по запросу"
              checked={value.priceOnRequest}
              onChange={(e) => patch({ priceOnRequest: e.target.checked })}
            />
            <Field label="Цена">
              <Input
                type="number"
                min={0}
                step="0.01"
                disabled={value.priceOnRequest}
                value={value.price}
                onChange={(e) => patch({ price: Math.max(0, Number(e.target.value) || 0) })}
              />
            </Field>
            <Field label="Старая цена" hint="Показывается зачёркнутой">
              <Input
                type="number"
                min={0}
                step="0.01"
                disabled={value.priceOnRequest}
                value={value.oldPrice ?? ""}
                onChange={(e) =>
                  patch({ oldPrice: e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </Field>
            <Field label="Наличие">
              <Select
                value={value.stockStatus}
                onChange={(e) => patch({ stockStatus: e.target.value as StockStatus })}
              >
                {(Object.keys(STOCK_STATUS_LABELS) as StockStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STOCK_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Остаток, шт.">
              <Input
                type="number"
                min={0}
                value={value.stock}
                onChange={(e) => patch({ stock: Math.max(0, Number(e.target.value) || 0) })}
              />
            </Field>
            <Field label="Артикул">
              <Input value={value.sku} onChange={(e) => patch({ sku: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
            Связи
          </h2>
          <Field label="Бренд" className="mt-4">
            <Select
              value={value.brandId ?? ""}
              onChange={(e) => patch({ brandId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">— не указан —</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </Field>

          <p className="mb-1.5 mt-4 text-xs font-semibold text-ink-600">Категории</p>
          <div className="max-h-72 overflow-y-auto rounded-lg border border-ink-200 p-2">
            {categories.map((category) => (
              <Checkbox
                key={category.id}
                label={category.label}
                checked={value.categoryIds.includes(category.id)}
                onChange={(e) =>
                  patch({
                    categoryIds: e.target.checked
                      ? [...value.categoryIds, category.id]
                      : value.categoryIds.filter((id) => id !== category.id),
                  })
                }
              />
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          {message ? (
            <p
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                message.tone === "ok" ? "text-emerald-600" : "text-brand-600"
              }`}
            >
              {message.tone === "ok" ? <Check className="size-4" aria-hidden /> : null}
              {message.text}
            </p>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className={buttonClass("primary", "lg", "w-full")}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Сохранить товар
          </button>

          {value.id ? (
            confirmDelete ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteProduct(value.id!);
                      if (!result.ok) {
                        setMessage({ tone: "bad", text: result.error });
                        setConfirmDelete(false);
                        return;
                      }
                      router.replace("/admin/products");
                    })
                  }
                  className={buttonClass("danger", "md", "flex-1")}
                >
                  Удалить навсегда
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className={buttonClass("ghost", "md", "flex-1")}
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className={buttonClass("ghost", "md", "w-full")}
              >
                Удалить товар
              </button>
            )
          ) : null}
        </div>
      </aside>
    </div>
  );
}
