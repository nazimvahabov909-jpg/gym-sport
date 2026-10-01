import type { Metadata } from "next";
import { htmlLang, locales, type Locale } from "@/i18n/routing";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function absolute(path: string) {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Canonical + hreflang block.
 *
 * `pathFor` returns the locale-specific path (slugs differ per language), or
 * null when that translation does not exist — a missing page must not claim an
 * alternate that 404s.
 */
export function alternatesFor(
  locale: Locale,
  pathFor: (l: Locale) => string | null,
): Metadata["alternates"] {
  // The home page's path is "", which is falsy — every check here compares
  // against null so the root does not silently lose its canonical tag.
  const languages: Record<string, string> = {};
  for (const l of locales) {
    const path = pathFor(l);
    if (path !== null) languages[htmlLang[l]] = absolute(`/${l}${path}`);
  }
  const self = pathFor(locale);
  const ru = pathFor("ru");
  if (ru !== null) languages["x-default"] = absolute(`/ru${ru}`);

  return {
    canonical: self !== null ? absolute(`/${locale}${self}`) : undefined,
    languages,
  };
}

/** Same path in every locale — used by static pages like /cart or /brands. */
export const samePath = (path: string) => () => path;

type OgInput = {
  title: string;
  description?: string | null;
  locale: Locale;
  path: string;
  images?: string[];
  type?: "website" | "article";
};

export function openGraph({ title, description, locale, path, images, type = "website" }: OgInput) {
  return {
    title,
    description: description ?? undefined,
    url: absolute(`/${locale}${path}`),
    siteName: "United Sport",
    locale: htmlLang[locale].replace("-", "_"),
    type,
    images: (images ?? ["/media/site/og-default.jpg"]).map((url) => ({
      url: url.startsWith("http") ? url : absolute(url),
    })),
  } satisfies Metadata["openGraph"];
}

// ─── JSON-LD ────────────────────────────────────────────────────────────────

export function organizationJsonLd(settings: { phone: string; email: string; address: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "United Sport",
    url: siteUrl(),
    logo: absolute("/media/site/logo.png"),
    email: settings.email,
    telephone: settings.phone,
    address: { "@type": "PostalAddress", addressCountry: "UZ", streetAddress: settings.address },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

type ProductLd = {
  name: string;
  description?: string | null;
  sku?: string | null;
  brand?: string | null;
  images: string[];
  url: string;
  price: number;
  priceOnRequest: boolean;
  inStock: boolean;
  currency: string;
};

export function productJsonLd(p: ProductLd) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    sku: p.sku ?? undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    image: p.images.map((i) => (i.startsWith("http") ? i : absolute(i))),
    offers: {
      "@type": "Offer",
      url: p.url,
      priceCurrency: p.currency,
      // Schema.org has no "call for price"; 0 with InStock would be a lie, so a
      // quote-only product advertises availability without a price claim.
      ...(p.priceOnRequest ? {} : { price: p.price }),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "United Sport",
    url: absolute(`/${locale}`),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absolute(`/${locale}/search`)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Renders a <script type="application/ld+json"> without dangerous escapes. */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
