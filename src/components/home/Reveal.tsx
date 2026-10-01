import type { ReactNode } from "react";

/**
 * Scroll-in reveal, done entirely in CSS with a view timeline.
 *
 * No JavaScript, so the markup is never left invisible: browsers without
 * `animation-timeline` support simply render the content as-is, and so does
 * anyone who asked for reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Staggers siblings, in ms — mapped onto the animation's entry range. */
  delay?: number;
  className?: string;
}) {
  const start = Math.min(18, 2 + Math.round(delay / 15));

  return (
    <div
      className={`reveal ${className}`}
      style={{ "--reveal-start": `${start}%` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
