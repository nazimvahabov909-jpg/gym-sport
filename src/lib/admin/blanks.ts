/**
 * Empty form values for the "create new" admin screens.
 *
 * These live outside the form components on purpose: those are `"use client"`
 * modules, and a Server Component cannot call a function exported from one.
 */
import { locales } from "@/i18n/routing";
import type { BrandFormValue } from "@/components/admin/BrandForm";
import type { CategoryFormValue } from "@/components/admin/CategoryForm";
import type { ContentFormValue } from "@/components/admin/ContentForm";
import type { SlideFormValue } from "@/components/admin/SlideForm";

export function blankCategory(): CategoryFormValue {
  return {
    key: "",
    parentId: null,
    image: "",
    sortOrder: 0,
    isActive: true,
    showInMenu: true,
    translations: locales.map((locale) => ({
      locale,
      name: "",
      slug: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
    })),
  };
}

export function blankBrand(): BrandFormValue {
  return {
    name: "",
    slug: "",
    logo: "",
    website: "",
    sortOrder: 0,
    isActive: true,
    descriptions: locales.map((locale) => ({ locale, description: "" })),
  };
}

export function blankContent(): ContentFormValue {
  return {
    key: "",
    image: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    isActive: true,
    sortOrder: 0,
    translations: locales.map((locale) => ({
      locale,
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
    })),
  };
}

export function blankSlide(sortOrder = 0): SlideFormValue {
  return {
    image: "",
    mobileImage: "",
    link: "",
    sortOrder,
    isActive: true,
    translations: locales.map((locale) => ({ locale, title: "", subtitle: "", buttonText: "" })),
  };
}
