"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { type Locale } from "@/i18n/routing";
import { deleteBrand, saveBrand, type BrandInput } from "@/app/actions/admin";
import { LOCALE_LABELS } from "@/lib/admin/labels";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/admin/ui";
import { Checkbox, Field, Input, Textarea } from "@/components/admin/fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { SingleImageField } from "@/components/admin/ImageUploader";

export type BrandFormValue = {
  id?: number;
  name: string;
  slug: string;
  logo: string;
  website: string;
  sortOrder: number;
  isActive: boolean;
  descriptions: { locale: Locale; description: string }[];
};


export function BrandForm({ initial }: { initial: BrandFormValue }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (next: Partial<BrandFormValue>) => setValue((v) => ({ ...v, ...next }));

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const payload: BrandInput = { ...value };
      const result = await saveBrand(payload);
      if (!result.ok) {
        setMessage({ tone: "bad", text: result.error });
        return;
      }
      setMessage({ tone: "ok", text: "Сохранено" });
      if (!value.id && result.data) {
        router.replace(`/admin/brands/${result.data.id}`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card className="p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
          Описание бренда
        </h2>
        <div className="mt-4">
          <LocaleTabs
            render={(locale) => {
              const t = value.descriptions.find((x) => x.locale === locale)!;
              return (
                <Field label={`Описание (${LOCALE_LABELS[locale]})`}>
                  <Textarea
                    rows={8}
                    value={t.description}
                    onChange={(e) =>
                      patch({
                        descriptions: value.descriptions.map((d) =>
                          d.locale === locale ? { ...d, description: e.target.value } : d,
                        ),
                      })
                    }
                  />
                </Field>
              );
            }}
          />
        </div>
      </Card>

      <aside className="space-y-6">
        <Card className="p-5">
          <div className="space-y-4">
            <Field label="Название *">
              <Input value={value.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field label="URL (slug)" hint="Оставьте пустым — сгенерируем из названия">
              <Input value={value.slug} onChange={(e) => patch({ slug: e.target.value })} />
            </Field>
            <Field label="Сайт">
              <Input
                value={value.website}
                onChange={(e) => patch({ website: e.target.value })}
                placeholder="https://"
              />
            </Field>
            <Field label="Порядок сортировки">
              <Input
                type="number"
                value={value.sortOrder}
                onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
              />
            </Field>
            <Checkbox
              label="Активен"
              checked={value.isActive}
              onChange={(e) => patch({ isActive: e.target.checked })}
            />
          </div>
        </Card>

        <Card className="p-5">
          <SingleImageField label="Логотип" value={value.logo} onChange={(logo) => patch({ logo })} />
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
            Сохранить бренд
          </button>
          {value.id ? (
            confirmDelete ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteBrand(value.id!);
                      if (!result.ok) {
                        setMessage({ tone: "bad", text: result.error });
                        setConfirmDelete(false);
                        return;
                      }
                      router.replace("/admin/brands");
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
                Удалить бренд
              </button>
            )
          ) : null}
        </div>
      </aside>
    </div>
  );
}
