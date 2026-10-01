"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";

export type Slide = {
  id: number;
  image: string;
  link: string | null;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
};

const INTERVAL = 6500;

export function HeroSlider({ slides, labels }: { slides: Slide[]; labels: { prev: string; next: string } }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    // Respect the OS setting instead of animating at people who opted out.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(id);
  }, [paused, go, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      className="relative overflow-hidden bg-ink-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 48) go(delta < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/8]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title ?? ""}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 via-ink-900/45 to-transparent" />

            <div className="container-page absolute inset-0 flex items-center">
              <div className="max-w-xl text-white">
                {slide.title ? (
                  <h1 className="text-3xl font-extrabold leading-[1.08] drop-shadow-sm sm:text-4xl lg:text-6xl">
                    {slide.title}
                  </h1>
                ) : null}
                {slide.subtitle ? (
                  <p className="mt-3 max-w-md text-sm text-white/85 sm:mt-4 sm:text-base lg:text-lg">
                    {slide.subtitle}
                  </p>
                ) : null}
                {slide.link && slide.buttonText ? (
                  <Link
                    href={slide.link}
                    tabIndex={i === index ? 0 : -1}
                    className={buttonClass("primary", "lg", "mt-6 sm:mt-8")}
                  >
                    {slide.buttonText}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6 lg:left-auto lg:right-8 lg:translate-x-0">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-brand-600" : "w-4 bg-white/45 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-4 lg:flex">
            {[
              { label: labels.prev, delta: -1, Icon: ChevronLeft },
              { label: labels.next, delta: 1, Icon: ChevronRight },
            ].map(({ label, delta, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => go(delta)}
                aria-label={label}
                className="grid size-11 place-items-center rounded-full border border-white/30 bg-ink-900/30 text-white backdrop-blur transition hover:bg-brand-600 hover:border-brand-600"
              >
                <Icon className="size-5" aria-hidden />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
