"use client";

import { useRef, type ReactNode } from "react";

/**
 * Pointer-driven 3D tilt.
 *
 * Writes CSS custom properties straight to the node instead of going through
 * React state — a re-render per mousemove would be far too expensive. Touch
 * devices and reduced-motion users never get a listener at all.
 */
export function Tilt({
  children,
  max = 9,
  scale = 1.015,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || !enabled()) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
    node.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
    node.style.setProperty("--s", String(scale));
  }

  function reset() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--s", "1");
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`stage-deep ${className}`}
      style={{
        transform:
          "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--s, 1))",
        transition: "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}
