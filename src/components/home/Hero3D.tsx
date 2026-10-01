"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";

export type HeroSlide = {
  id: number;
  image: string;
  link: string | null;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
};

export type HeroStat = { value: string; label: string };

const INTERVAL = 7000;

/**
 * The hero is a 3D stage: a tilted glass panel holds the slide art while the
 * headline and stat chips sit in front of it on their own Z planes, so moving
 * the pointer parallaxes the layers against each other.
 *
 * Everything is CSS transforms — no WebGL, nothing extra to download, and the
 * whole effect collapses to a flat, still image on touch and reduced motion.
 */
export function Hero3D({
  slides,
  stats,
  badge,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  scrollLabel,
  navLabels,
}: {
  slides: HeroSlide[];
  stats: HeroStat[];
  badge: string;
  headline: string;
  subheadline: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  scrollLabel: string;
  navLabels: { prev: string; next: string };
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(id);
  }, [paused, go, slides.length]);

  function onPointerMove(event: React.MouseEvent<HTMLElement>) {
    const node = stage.current;
    if (!node) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--hx", `${(x * 12).toFixed(2)}deg`);
    node.style.setProperty("--hy", `${(-y * 8).toFixed(2)}deg`);
  }

  function resetPointer() {
    stage.current?.style.setProperty("--hx", "0deg");
    stage.current?.style.setProperty("--hy", "0deg");
  }

  const active = slides[index];

  return (
    <section
      onMouseMove={onPointerMove}
      onMouseLeave={() => {
        resetPointer();
        setPaused(false);
      }}
      onMouseEnter={() => setPaused(true)}
      className="relative overflow-hidden bg-ink-900 text-white"
    >
      {/* Depth layers behind the content: colour clouds, then a faint grid. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="aurora -left-24 top-[-18%] size-[26rem] bg-brand-600/60 md:size-[34rem]" />
        <span
          className="aurora right-[-10%] top-[10%] size-[24rem] bg-navy-600/70 md:size-[32rem]"
          style={{ animationDelay: "-8s" }}
        />
        <span
          className="aurora bottom-[-25%] left-[35%] size-[22rem] bg-brand-500/35 md:size-[30rem]"
          style={{ animationDelay: "-15s" }}
        />
        <div className="grid-veil absolute inset-0" />
      </div>

      <div className="container-page relative stage pb-14 pt-12 md:pb-20 md:pt-16 lg:pb-24 lg:pt-20">
        <div
          ref={stage}
          className="stage-deep grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8"
          style={{ transform: "rotateY(var(--hx, 0deg)) rotateX(var(--hy, 0deg))", transition: "transform 500ms cubic-bezier(0.16,1,0.3,1)" }}
        >
          {/* ── Copy plane ─────────────────────────────────────────────── */}
          <div style={{ transform: "translateZ(60px)" }}>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur">
              <span className="size-1.5 rounded-full bg-brand-500" />
              {badge}
            </p>

            <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              {headline}
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
              {subheadline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryCta.href} className={buttonClass("primary", "lg", "group")}>
                {primaryCta.label}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <Link
                href={secondaryCta.href}
                className={buttonClass(
                  "ghost",
                  "lg",
                  "border border-white/20 text-white hover:bg-white/10",
                )}
              >
                {secondaryCta.label}
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="glass rounded-xl px-3 py-3.5">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-extrabold leading-none">
                      {stat.value}
                    </span>
                    <span className="mt-1.5 block text-[10px] leading-tight text-white/55">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Art plane ──────────────────────────────────────────────── */}
          <div
            className="relative"
            style={{ transform: "translateZ(20px)" }}
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
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/5 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)] backdrop-blur-sm sm:aspect-[5/4]"
              style={{ transform: "rotateY(-7deg) rotateX(3deg)", transformStyle: "preserve-3d" }}
            >
              {slides.map((slide, i) => (
                <Image
                  key={slide.id}
                  src={slide.image}
                  alt={slide.title ?? ""}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className={`object-cover transition-all duration-[900ms] ${
                    i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent" />

              {active ? (
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  {active.title ? (
                    <p className="font-display text-lg font-extrabold leading-tight sm:text-2xl">
                      {active.title}
                    </p>
                  ) : null}
                  {active.subtitle ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-white/65 sm:text-sm">
                      {active.subtitle}
                    </p>
                  ) : null}
                  {active.link && active.buttonText ? (
                    <Link
                      href={active.link}
                      className="mt-4 inline-flex items-center gap-1.5 border-b border-brand-500 pb-0.5 text-sm font-bold text-white transition hover:gap-3"
                    >
                      {active.buttonText}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>

            {slides.length > 1 ? (
              <div
                className="mt-5 flex items-center gap-3"
                style={{ transform: "translateZ(40px)" }}
              >
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={navLabels.prev}
                  className="grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition hover:border-brand-500 hover:bg-brand-600 hover:text-white"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={navLabels.next}
                  className="grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition hover:border-brand-500 hover:bg-brand-600 hover:text-white"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>

                <div className="ml-1 flex gap-1.5">
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`${i + 1}`}
                      aria-current={i === index}
                      className={`h-1 rounded-full transition-all ${
                        i === index ? "w-8 bg-brand-500" : "w-4 bg-white/25 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-12 hidden items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/35 lg:flex">
          <span className="block h-px w-10 bg-white/25" />
          {scrollLabel}
        </p>
      </div>
    </section>
  );
}
