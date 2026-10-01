"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { type Locale } from "@/i18n/routing";
import { deletePage, deletePost, savePage, savePost } from "@/app/actions/admin";
import { LOCALE_LABELS } from "@/lib/admin/labels";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/admin/ui";
import { Checkbox, Field, Input, Textarea } from "@/components/admin/fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { SingleImageField } from "@/components/admin/ImageUploader";

export type ContentTranslation = {
  locale: Locale;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
};

export type ContentFormValue = {
  id?: number;
  /** Pages carry a machine key; posts carry a cover image and a date. */
  key: string;
  image: string;
  publishedAt: string;
  isActive: boolean;
  sortOrder: number;
  translations: ContentTranslation[];
};


export function ContentForm({
  kind,
  initial,
}: {
  kind: "page" | "post";
  initial: ContentFormValue;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const listHref = kind === "page" ? "/admin/pages" : "/admin/posts";
  const patch = (next: Partial<ContentFormValue>) => setValue((v) => ({ ...v, ...next }));
  const patchTranslation = (locale: Locale, next: Partial<ContentTranslation>) =>
    setValue((v) => ({
      ...v,
      translations: v.translations.map((t) => (t.locale === locale ? { ...t, ...next } : t)),
    }));

  const incomplete = value.translations.filter((t) => !t.title.trim()).map((t) => t.locale);

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result =
        kind === "page"
          ? await savePage({
              id: value.id,
              key: value.key.trim(),
              isActive: value.isActive,
              sortOrder: value.sortOrder,
              translations: value.translations.map((t) => ({
                locale: t.locale,
                title: t.title,
                slug: t.slug,
                content: t.content,
                metaTitle: t.metaTitle,
                metaDescription: t.metaDescription,
              })),
            })
          : await savePost({
              id: value.id,
              image: value.image,
              isActive: value.isActive,
              publishedAt: value.publishedAt,
              translations: value.translations.map((t) => ({
                locale: t.locale,
                title: t.title,
                slug: t.slug,
                excerpt: t.excerpt,
                content: t.content,
                metaTitle: t.metaTitle,
                metaDescription: t.metaDescription,
              })),
            });

      if (!result.ok) {
        setMessage({ tone: "bad", text: result.error });
        return;
      }
      setMessage({ tone: "ok", text: "Сохранено" });
      if (!value.id && result.data) {
        router.replace(`${listHref}/${result.data.id}`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card className="p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
          Содержимое
        </h2>
        <div className="mt-4">
          <LocaleTabs
            incomplete={incomplete}
            render={(locale) => {
              const t = value.translations.find((x) => x.locale === locale)!;
              return (
                <div className="grid gap-4">
                  <Field label={`Заголовок (${LOCALE_LABELS[locale]}) *`}>
                    <Input value={t.title} onChange={(e) => patchTranslation(locale, { title: e.target.value })} />
                  </Field>
                  <Field label="URL (slug)" hint="Оставьте пустым — сгенерируем из заголовка">
                    <Input value={t.slug} onChange={(e) => patchTranslation(locale, { slug: e.target.value })} />
                  </Field>
                  {kind === "post" ? (
                    <Field label="Краткое описание" hint="Показывается в списке статей">
                      <Textarea
                        rows={3}
                        value={t.excerpt}
                        onChange={(e) => patchTranslation(locale, { excerpt: e.target.value })}
                      />
                    </Field>
                  ) : null}
                  <Field label="Текст" hint="HTML: <p>, <h2>, <ul>, <li>, <strong>, <a href>">
                    <Textarea
                      rows={16}
                      value={t.content}
                      onChange={(e) => patchTranslation(locale, { content: e.target.value })}
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
          <div className="space-y-4">
            {kind === "page" ? (
              <>
                <Field label="Ключ *" hint="Латиница и дефисы: about, delivery…">
                  <Input
                    value={value.key}
                    onChange={(e) => patch({ key: e.target.value.toLowerCase() })}
                  />
                </Field>
                <Field label="Порядок в подвале">
                  <Input
                    type="number"
                    value={value.sortOrder}
                    onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
                  />
                </Field>
              </>
            ) : (
              <Field label="Дата публикации">
                <Input
                  type="date"
                  value={value.publishedAt}
                  onChange={(e) => patch({ publishedAt: e.target.value })}
                />
              </Field>
            )}
            <Checkbox
              label="Опубликовано"
              checked={value.isActive}
              onChange={(e) => patch({ isActive: e.target.checked })}
            />
          </div>
        </Card>

        {kind === "post" ? (
          <Card className="p-5">
            <SingleImageField label="Обложка" value={value.image} onChange={(image) => patch({ image })} />
          </Card>
        ) : null}

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
            Сохранить
          </button>
          {value.id ? (
            confirmDelete ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result =
                        kind === "page" ? await deletePage(value.id!) : await deletePost(value.id!);
                      if (!result.ok) {
                        setMessage({ tone: "bad", text: result.error });
                        setConfirmDelete(false);
                        return;
                      }
                      router.replace(listHref);
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
                Удалить
              </button>
            )
          ) : null}
        </div>
      </aside>
    </div>
  );
}
