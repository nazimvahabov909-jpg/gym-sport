import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Панель управления", template: "%s · United Sport" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: "#16171c" };

/**
 * The admin area is its own root layout: it never loads the storefront chrome,
 * its own fonts, or the locale machinery.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${inter.variable}`}>
      {/* See the storefront layout: browser extensions mutate <body> attributes
          before hydration. */}
      <body
        suppressHydrationWarning
        className="min-h-dvh bg-ink-50 font-sans text-ink-900 antialiased"
      >
        {children}
      </body>
    </html>
  );
}
