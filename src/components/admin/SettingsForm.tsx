"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { saveSettings, type SettingsInput } from "@/app/actions/admin";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/admin/ui";
import { Field, Input } from "@/components/admin/fields";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const patch = (next: Partial<SettingsInput>) => setValue((v) => ({ ...v, ...next }));

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
          Контакты
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Телефон *">
            <Input value={value.phone} onChange={(e) => patch({ phone: e.target.value })} />
          </Field>
          <Field label="Второй телефон">
            <Input
              value={value.phoneSecondary ?? ""}
              onChange={(e) => patch({ phoneSecondary: e.target.value })}
            />
          </Field>
          <Field label="E-mail *">
            <Input type="email" value={value.email} onChange={(e) => patch({ email: e.target.value })} />
          </Field>
          <Field label="Часы работы">
            <Input
              value={value.workingHours}
              onChange={(e) => patch({ workingHours: e.target.value })}
            />
          </Field>
          <Field label="Адрес" className="sm:col-span-2">
            <Input value={value.address} onChange={(e) => patch({ address: e.target.value })} />
          </Field>
          <Field label="Валюта *" hint="Трёхбуквенный код: UZS, USD, AZN…">
            <Input
              value={value.currency}
              maxLength={3}
              onChange={(e) => patch({ currency: e.target.value.toUpperCase() })}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-500">
          Социальные сети
        </h2>
        <p className="mt-1 text-xs text-ink-400">Пустые поля не показываются в подвале сайта</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Telegram">
            <Input
              value={value.telegram ?? ""}
              placeholder="https://t.me/…"
              onChange={(e) => patch({ telegram: e.target.value })}
            />
          </Field>
          <Field label="Instagram">
            <Input
              value={value.instagram ?? ""}
              placeholder="https://instagram.com/…"
              onChange={(e) => patch({ instagram: e.target.value })}
            />
          </Field>
          <Field label="Facebook">
            <Input
              value={value.facebook ?? ""}
              placeholder="https://facebook.com/…"
              onChange={(e) => patch({ facebook: e.target.value })}
            />
          </Field>
          <Field label="YouTube">
            <Input
              value={value.youtube ?? ""}
              placeholder="https://youtube.com/…"
              onChange={(e) => patch({ youtube: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setMessage(null);
              const result = await saveSettings(value);
              if (!result.ok) {
                setMessage({ tone: "bad", text: result.error });
                return;
              }
              setMessage({ tone: "ok", text: "Настройки сохранены" });
              router.refresh();
            })
          }
          className={buttonClass("primary", "lg")}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Сохранить
        </button>
        {message ? (
          <span
            className={`flex items-center gap-1.5 text-sm font-semibold ${
              message.tone === "ok" ? "text-emerald-600" : "text-brand-600"
            }`}
          >
            {message.tone === "ok" ? <Check className="size-4" aria-hidden /> : null}
            {message.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
