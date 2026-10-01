"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { type Locale } from "@/i18n/routing";
import { deleteCategory, saveCategory, type CategoryInput } from "@/app/actions/admin";
import { LOCALE_LABELS } from "@/lib/admin/labels";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/admin/ui";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/admin/fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { SingleImageField } from "@/components/admin/ImageUploader";

export type CategoryFormValue = {
  id?: number;
  key: string;
  parentId: number | null;
  image: string;
  sortOrder: number;
  isActive: boolean;
  showInMenu: boolean;
  translations: {
    locale: Locale;
    name: string;
    slug: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
  }[];
};

export function CategoryForm({
  initial,
  parents,
}: {
  initial: CategoryFormValue;
  parents: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (next: Partial<CategoryFormValue>) => setValue((v) => ({ ...v, ...next }));
  const patchTranslation = (locale: Locale, next: Partial<CategoryFormValue["translations"][number]>) =>
    setValue((v) => ({
      ...v,
      translations: v.translations.map((t) => (t.locale === locale ? { ...t, ...next } : t)),
    }));

  const incomplete = value.translations.filter((t) => !t.name.trim()).map((t) => t.locale);

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const payload: CategoryInput = {
        id: value.id,
        key: value.key.trim(),
        parentId: value.parentId,
        image: value.image,
        sortOrder: value.sortOrder,
        isActive: value.isActive,
        showInMenu: value.showInMenu,
        translations: value.translations,
      };
      const result = await saveCategory(payload);
      if (!result.ok) {
        setMessage({ tone: "bad", text: result.error });
        return;
      }
      setMessage({ tone: "ok", text: "Сохранено" });
      if (!value.id && result.data) {
        router.replace(`/admin/categories/${result.data.id}`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card className="p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">Тексты</h2>
        <div className="mt-4">
          <LocaleTabs
            incomplete={incomplete}
            render={(locale) => {
              const t = value.translations.find((x) => x.locale === locale)!;
              return (
                <div className="grid gap-4">
                  <Field label={`Название (${LOCALE_LABELS[locale]}) *`}>
                    <Input value={t.name} onChange={(e) => patchTranslation(locale, { name: e.target.value })} />
                  </Field>
                  <Field label="URL (slug)" hint="Оставьте пустым — сгенерируем из названия">
                    <Input value={t.slug} onChange={(e) => patchTranslation(locale, { slug: e.target.value })} />
                  </Field>
                  <Field label="Описание" hint="Показывается под заголовком категории">
                    <Textarea
                      rows={4}
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

      <aside className="space-y-6">
        <Card className="p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
            Настройки
          </h2>
          <div className="mt-4 space-y-4">
            <Field label="Ключ *" hint="Латиница и дефисы, не меняется после создания">
              <Input
                value={value.key}
                onChange={(e) => patch({ key: e.target.value.toLowerCase() })}
                placeholder="treadmills"
              />
            </Field>
            <Field label="Родительская категория">
              <Select
                value={value.parentId ?? ""}
                onChange={(e) => patch({ parentId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">— корневая —</option>
                {parents
                  .filter((p) => p.id !== value.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Порядок сортировки">
              <Input
                type="number"
                value={value.sortOrder}
                onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
              />
            </Field>
            <div>
              <Checkbox
                label="Активна"
                checked={value.isActive}
                onChange={(e) => patch({ isActive: e.target.checked })}
              />
              <Checkbox
                label="Показывать в меню"
                checked={value.showInMenu}
                onChange={(e) => patch({ showInMenu: e.target.checked })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SingleImageField
            label="Изображение категории"
            value={value.image}
            onChange={(image) => patch({ image })}
          />
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
            Сохранить категорию
          </button>

          {value.id ? (
            confirmDelete ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteCategory(value.id!);
                      if (!result.ok) {
                        setMessage({ tone: "bad", text: result.error });
                        setConfirmDelete(false);
                        return;
                      }
                      router.replace("/admin/categories");
                    })
                  }
                  className={buttonClass("danger", "md", "flex-1")}
                >
                  Удалить
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
                Удалить категорию
              </button>
            )
          ) : null}
        </div>
      </aside>
    </div>
  );
}
