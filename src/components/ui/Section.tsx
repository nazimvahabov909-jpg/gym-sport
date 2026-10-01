import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/** Section header used across the home page: eyebrow + title + optional link. */
export function SectionHeading({
  title,
  eyebrow,
  href,
  linkLabel,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="text-2xl font-extrabold md:text-3xl">{title}</h2>
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="shrink-0 border-b border-ink-300 pb-0.5 text-sm font-semibold text-ink-600 transition hover:border-brand-600 hover:text-brand-600"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`py-10 md:py-16 ${className}`}>{children}</section>;
}
