import Image from "next/image";
import { Link } from "@/i18n/navigation";

export type MarqueeBrand = { id: number; name: string; slug: string; logo: string | null };

/**
 * Seamless logo ribbon. The list is rendered twice and the track slides exactly
 * half its width, so the loop has no visible seam and needs no JavaScript.
 */
export function BrandMarquee({ brands }: { brands: MarqueeBrand[] }) {
  if (brands.length === 0) return null;
  const loop = [...brands, ...brands];

  return (
    <div className="relative overflow-hidden py-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent"
      />

      <ul className="flex w-max gap-4 animate-[var(--animate-marquee)] hover:[animation-play-state:paused]">
        {loop.map((brand, i) => (
          <li key={`${brand.id}-${i}`} aria-hidden={i >= brands.length}>
            <Link
              href={`/brands/${brand.slug}`}
              tabIndex={i >= brands.length ? -1 : undefined}
              className="flex h-20 w-40 items-center justify-center rounded-xl border border-ink-100 bg-white px-5 grayscale transition hover:border-ink-300 hover:grayscale-0 sm:w-48"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={150}
                  height={150}
                  sizes="192px"
                  className="max-h-12 w-auto object-contain"
                />
              ) : (
                <span className="font-display font-bold text-ink-700">{brand.name}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
