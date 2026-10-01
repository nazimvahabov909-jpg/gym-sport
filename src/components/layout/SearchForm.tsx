"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export function SearchForm({
  placeholder,
  label,
  autoFocus = false,
  onDone,
}: {
  placeholder: string;
  label: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const input = useRef<HTMLInputElement>(null);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (q.length < 2) {
          input.current?.focus();
          return;
        }
        onDone?.();
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
      className="relative flex w-full items-center"
    >
      <label htmlFor="site-search" className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-4 size-4 text-ink-400" aria-hidden />
      <input
        id="site-search"
        ref={input}
        type="search"
        name="q"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        className="h-11 w-full rounded-full border border-ink-200 bg-ink-50/60 pl-11 pr-11 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            input.current?.focus();
          }}
          className="absolute right-3 grid size-6 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          aria-label={label}
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </form>
  );
}
