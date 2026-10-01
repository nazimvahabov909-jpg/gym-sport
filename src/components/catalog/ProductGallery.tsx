"use client";

import { useState } from "react";
import Image from "next/image";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({
  images,
  name,
  label,
}: {
  images: GalleryImage[];
  name: string;
  label: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-card bg-ink-50 text-sm text-ink-300">
        —
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex flex-col gap-3" aria-label={label}>
      <div className="relative aspect-square overflow-hidden rounded-card border border-ink-100 bg-white">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt ?? name}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain p-6 md:p-10"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${name} ${i + 1}`}
                aria-current={i === active}
                className={`relative block size-18 shrink-0 overflow-hidden rounded-lg border bg-white transition sm:size-20 ${
                  i === active ? "border-brand-600" : "border-ink-100 hover:border-ink-300"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
