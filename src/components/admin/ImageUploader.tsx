"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, ImagePlus, Loader2, X } from "lucide-react";

const ERRORS: Record<string, string> = {
  unauthorized: "Сессия истекла — войдите заново",
  no_file: "Файл не выбран",
  unsupported_type: "Поддерживаются JPG, PNG, WebP, AVIF, GIF и SVG",
  too_large: "Файл больше 8 МБ",
};

async function upload(file: File): Promise<{ url: string } | { error: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = await res.json().catch(() => ({ error: "failed" }));
  if (!res.ok) return { error: ERRORS[json.error] ?? "Не удалось загрузить файл" };
  return json as { url: string };
}

/** Single image slot — used for logos, slides and post covers. */
export function SingleImageField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink-600">{label}</p>

      <div className="flex items-start gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
          {value ? (
            <Image src={value} alt="" fill sizes="96px" className="object-contain p-1" />
          ) : (
            <div className="grid size-full place-items-center text-ink-300">
              <ImagePlus className="size-6" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={input}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy(true);
              setError(null);
              const result = await upload(file);
              setBusy(false);
              if ("error" in result) setError(result.error);
              else onChange(result.url);
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold transition hover:border-ink-400 disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
              Загрузить
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink-500 transition hover:text-brand-600"
              >
                <X className="size-4" aria-hidden />
                Убрать
              </button>
            ) : null}
          </div>

          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/media/…"
            className="h-9 w-full rounded-lg border border-ink-200 px-3 text-xs outline-none transition focus:border-brand-500"
          />
          {error ? <p className="text-xs font-semibold text-brand-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

export type GalleryItem = { url: string; alt?: string };

/** Ordered gallery — the first image is the one shown on catalogue cards. */
export function GalleryField({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (next: GalleryItem[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-600">Фотографии</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold transition hover:border-ink-400 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <ImagePlus className="size-3.5" aria-hidden />}
          Добавить
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length === 0) return;
          setBusy(true);
          setError(null);
          const added: GalleryItem[] = [];
          for (const file of files) {
            const result = await upload(file);
            if ("error" in result) setError(result.error);
            else added.push({ url: result.url });
          }
          setBusy(false);
          if (added.length) onChange([...items, ...added]);
        }}
      />

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-xs text-ink-400">
          Пока нет фотографий
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={`${item.url}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-2"
            >
              <span className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label="Выше"
                  className="text-ink-400 transition hover:text-ink-900 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1}
                  aria-label="Ниже"
                  className="text-ink-400 transition hover:text-ink-900 disabled:opacity-30"
                >
                  ▼
                </button>
              </span>

              <div className="relative size-14 shrink-0 overflow-hidden rounded border border-ink-100 bg-ink-50">
                <Image src={item.url} alt="" fill sizes="56px" className="object-contain p-0.5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-ink-500">{item.url}</p>
                <input
                  value={item.alt ?? ""}
                  onChange={(e) =>
                    onChange(items.map((it, idx) => (idx === i ? { ...it, alt: e.target.value } : it)))
                  }
                  placeholder="alt-текст"
                  className="mt-1 h-8 w-full rounded border border-ink-200 px-2 text-xs outline-none transition focus:border-brand-500"
                />
              </div>

              {i === 0 ? (
                <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-500">
                  главная
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                aria-label="Удалить"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="mt-2 text-xs font-semibold text-brand-600">{error}</p> : null}
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-400">
        <GripVertical className="size-3" aria-hidden />
        Первая фотография используется в каталоге
      </p>
    </div>
  );
}
