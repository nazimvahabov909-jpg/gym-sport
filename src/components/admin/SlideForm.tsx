"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { type Locale } from "@/i18n/routing";
import { deleteSlide, saveSlide } from "@/app/actions/admin";
import { LOCALE_LABELS } from "@/lib/admin/labels";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/admin/ui";
import { Checkbox, Field, Input } from "@/components/admin/fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { SingleImageField } from "@/components/admin/ImageUploader";

export type SlideFormValue = {
  id?: number;
  image: string;
  mobileImage: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
  translations: { locale: Locale; title: string; subtitle: string; buttonText: string }[];
};


export function SlideForm({ initial }: { initial: SlideFormValue }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (next: Partial<SlideFormValue>) => setValue((v) => ({ ...v, ...next }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card className="p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
          Подписи
        </h2>
        <div className="mt-4">
          <LocaleTabs
            render={(locale) => {
              const t = value.translations.find((x) => x.locale === locale)!;
              const set = (next: Partial<typeof t>) =>
                patch({
                  translations: value.translations.map((x) =>
                    x.locale === locale ? { ...x, ...next } : x,
                  ),
                });
              return (
                <div className="grid gap-4">
                  <Field label={`Заголовок (${LOCALE_LABELS[locale]})`}>
                    <Input value={t.title} onChange={(e) => set({ title: e.target.value })} />
                  </Field>
                  <Field label="Подзаголовок">
                    <Input value={t.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
                  </Field>
                  <Field label="Текст кнопки" hint="Кнопка появится, если заполнены текст и ссылка">
                    <Input value={t.buttonText} onChange={(e) => set({ buttonText: e.target.value })} />
                  </Field>
                </div>
              );
            }}
          />
        </div>
      </Card>

      <aside className="space-y-6">
        <Card className="p-5">
          <SingleImageField
            label="Изображение *"
            value={value.image}
            onChange={(image) => patch({ image })}
          />
          <div className="mt-5">
            <SingleImageField
              label="Изображение для телефона"
              value={value.mobileImage}
              onChange={(mobileImage) => patch({ mobileImage })}
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="space-y-4">
            <Field label="Ссылка" hint="Например: /catalog/begovye-dorozhki">
              <Input value={value.link} onChange={(e) => patch({ link: e.target.value })} />
            </Field>
            <Field label="Порядок">
              <Input
                type="number"
                value={value.sortOrder}
                onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
              />
            </Field>
            <Checkbox
              label="Показывать на сайте"
              checked={value.isActive}
              onChange={(e) => patch({ isActive: e.target.checked })}
            />
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
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setMessage(null);
                const result = await saveSlide(value);
                if (!result.ok) {
                  setMessage({ tone: "bad", text: result.error });
                  return;
                }
                setMessage({ tone: "ok", text: "Сохранено" });
                if (!value.id && result.data) {
                  router.replace(`/admin/slides/${result.data.id}`);
                  return;
                }
                router.refresh();
              })
            }
            className={buttonClass("primary", "lg", "w-full")}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Сохранить слайд
          </button>
          {value.id ? (
            confirmDelete ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteSlide(value.id!);
                      if (!result.ok) {
                        setMessage({ tone: "bad", text: result.error });
                        setConfirmDelete(false);
                        return;
                      }
                      router.replace("/admin/slides");
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
                Удалить слайд
              </button>
            )
          ) : null}
        </div>
      </aside>
    </div>
  );
}
