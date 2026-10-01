import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Montserrat } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { htmlLang, routing, type Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/settings";
import { jsonLdScript, organizationJsonLd, siteUrl } from "@/lib/seo";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#db1b25",
  colorScheme: "light",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: "United Sport — оборудование для фитнес-клубов и дома",
      template: "%s | United Sport",
    },
    applicationName: "United Sport",
    icons: { icon: "/favicon.ico", apple: "/media/site/logo.png" },
    robots: { index: true, follow: true },
    openGraph: { siteName: "United Sport", locale: htmlLang[safe].replace("-", "_") },
    formatDetection: { telephone: true },
  };
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [settings, t] = await Promise.all([getSettings(), getTranslations()]);

  return (
    <html lang={htmlLang[locale as Locale]} className={`${inter.variable} ${montserrat.variable}`}>
      {/* Extensions such as Grammarly add their own attributes to <body> before
          React hydrates, which React would otherwise report as a mismatch. The
          suppression is one level deep, so real mismatches inside the page are
          still reported. */}
      <body
        suppressHydrationWarning
        className="flex min-h-dvh flex-col bg-white text-ink-900 antialiased"
      >
        <NextIntlClientProvider>
          <SessionProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
          >
            {t("common.skipToContent")}
          </a>
          <SiteHeader locale={locale as Locale} settings={settings} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter locale={locale as Locale} settings={settings} />
          </SessionProvider>
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd(settings)) }}
        />
      </body>
    </html>
  );
}
