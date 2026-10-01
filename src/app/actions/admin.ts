"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { locales } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/guard";
import { slugify } from "@/lib/slug";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });

/** Normalises an admin-typed slug; falls back to the name when left blank. */
function resolveSlug(slug: string | undefined, fallback: string) {
  const candidate = slugify(slug?.trim() || fallback);
  return candidate || `item-${Date.now()}`;
}

const translationSchema = z.object({
  locale: z.enum(locales),
  name: z.string().trim().min(1).max(255),
  slug: z.string().trim().max(255).optional(),
  shortDescription: z.string().trim().max(500).optional(),
  description: z.string().trim().max(60000).optional(),
  metaTitle: z.string().trim().max(255).optional(),
  metaDescription: z.string().trim().max(500).optional(),
});

// ─── Orders ─────────────────────────────────────────────────────────────────

const orderStatuses = [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export async function updateOrderStatus(input: {
  orderId: number;
  status: (typeof orderStatuses)[number];
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  note?: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = z
      .object({
        orderId: z.number().int().positive(),
        status: z.enum(orderStatuses),
        paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
        note: z.string().trim().max(500).optional(),
      })
      .safeParse(input);
    if (!parsed.success) return fail("Проверьте данные");

    await db.order.update({
      where: { id: parsed.data.orderId },
      data: {
        status: parsed.data.status,
        ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
        history: { create: { status: parsed.data.status, note: parsed.data.note || null } },
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    return { ok: true };
  } catch {
    return fail("Не удалось сохранить");
  }
}

export async function updateOrderTotals(input: {
  orderId: number;
  items: { id: number; price: number }[];
  shippingCost: number;
  discount: number;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = z
      .object({
        orderId: z.number().int().positive(),
        items: z.array(z.object({ id: z.number().int().positive(), price: z.number().min(0) })),
        shippingCost: z.number().min(0),
        discount: z.number().min(0),
      })
      .safeParse(input);
    if (!parsed.success) return fail("Проверьте данные");

    const existing = await db.orderItem.findMany({
      where: { orderId: parsed.data.orderId },
      select: { id: true, quantity: true },
    });

    let subtotal = 0;
    for (const item of existing) {
      const price = parsed.data.items.find((i) => i.id === item.id)?.price ?? 0;
      const total = price * item.quantity;
      subtotal += total;
      await db.orderItem.update({ where: { id: item.id }, data: { price, total } });
    }

    const total = Math.max(0, subtotal + parsed.data.shippingCost - parsed.data.discount);
    await db.order.update({
      where: { id: parsed.data.orderId },
      data: {
        subtotal,
        shippingCost: parsed.data.shippingCost,
        discount: parsed.data.discount,
        total,
        // Prices are filled in — the order no longer waits for a quote.
        needsQuote: subtotal <= 0,
      },
    });

    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    return { ok: true };
  } catch {
    return fail("Не удалось сохранить");
  }
}

// ─── Leads ──────────────────────────────────────────────────────────────────

export async function updateLeadStatus(input: {
  leadId: number;
  status: "NEW" | "IN_PROGRESS" | "DONE" | "SPAM";
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.lead.update({ where: { id: input.leadId }, data: { status: input.status } });
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch {
    return fail("Не удалось сохранить");
  }
}

export async function deleteLead(leadId: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.lead.delete({ where: { id: leadId } });
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch {
    return fail("Не удалось удалить");
  }
}

// ─── Products ───────────────────────────────────────────────────────────────

const productSchema = z.object({
  id: z.number().int().positive().optional(),
  sku: z.string().trim().max(120).optional(),
  brandId: z.number().int().positive().nullable().optional(),
  price: z.number().min(0).max(1_000_000_000),
  oldPrice: z.number().min(0).max(1_000_000_000).nullable().optional(),
  priceOnRequest: z.boolean(),
  stock: z.number().int().min(0).max(1_000_000),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "ON_ORDER"]),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  sortOrder: z.number().int(),
  categoryIds: z.array(z.number().int().positive()),
  images: z.array(z.object({ url: z.string().trim().min(1).max(512), alt: z.string().trim().max(255).optional() })),
  specs: z.array(
    z.object({
      locale: z.enum(locales),
      name: z.string().trim().min(1).max(191),
      value: z.string().trim().min(1).max(500),
    }),
  ),
  translations: z.array(translationSchema).length(locales.length),
});

export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(input: ProductInput): Promise<ActionResult<{ id: number }>> {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return fail("Заполните название на всех языках и проверьте цены");
    const data = parsed.data;

    const product = data.id
      ? await db.product.update({
          where: { id: data.id },
          data: {
            sku: data.sku || null,
            brandId: data.brandId ?? null,
            price: data.price,
            oldPrice: data.oldPrice ?? null,
            priceOnRequest: data.priceOnRequest,
            stock: data.stock,
            stockStatus: data.stockStatus,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
            isNew: data.isNew,
            sortOrder: data.sortOrder,
          },
        })
      : await db.product.create({
          data: {
            sku: data.sku || null,
            brandId: data.brandId ?? null,
            price: data.price,
            oldPrice: data.oldPrice ?? null,
            priceOnRequest: data.priceOnRequest,
            stock: data.stock,
            stockStatus: data.stockStatus,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
            isNew: data.isNew,
            sortOrder: data.sortOrder,
          },
        });

    for (const translation of data.translations) {
      const slug = await uniqueProductSlug(
        resolveSlug(translation.slug, translation.name),
        translation.locale,
        product.id,
      );
      const payload = {
        name: translation.name,
        slug,
        shortDescription: translation.shortDescription || null,
        description: translation.description || null,
        metaTitle: translation.metaTitle || null,
        metaDescription: translation.metaDescription || null,
      };
      await db.productTranslation.upsert({
        where: { productId_locale: { productId: product.id, locale: translation.locale } },
        create: { productId: product.id, locale: translation.locale, ...payload },
        update: payload,
      });
    }

    await db.productCategory.deleteMany({ where: { productId: product.id } });
    if (data.categoryIds.length) {
      await db.productCategory.createMany({
        data: data.categoryIds.map((categoryId, i) => ({
          productId: product.id,
          categoryId,
          isPrimary: i === 0,
        })),
      });
    }

    await db.productImage.deleteMany({ where: { productId: product.id } });
    if (data.images.length) {
      await db.productImage.createMany({
        data: data.images.map((image, i) => ({
          productId: product.id,
          url: image.url,
          alt: image.alt || null,
          sortOrder: i,
        })),
      });
    }

    await db.productSpec.deleteMany({ where: { productId: product.id } });
    if (data.specs.length) {
      await db.productSpec.createMany({
        data: data.specs.map((spec, i) => ({
          productId: product.id,
          locale: spec.locale,
          name: spec.name,
          value: spec.value,
          sortOrder: i,
        })),
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { ok: true, data: { id: product.id } };
  } catch {
    return fail("Не удалось сохранить товар");
  }
}

/** Slugs are unique per locale; append -2, -3 … when the admin picks a taken one. */
async function uniqueProductSlug(base: string, locale: string, productId: number) {
  let candidate = base;
  for (let n = 2; n < 60; n += 1) {
    const clash = await db.productTranslation.findUnique({
      where: { locale_slug: { locale, slug: candidate } },
      select: { productId: true },
    });
    if (!clash || clash.productId === productId) return candidate;
    candidate = `${base}-${n}`;
  }
  return `${base}-${productId}`;
}

export async function deleteProduct(productId: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return fail("Не удалось удалить — товар используется в заказах");
  }
}

export async function toggleProductActive(productId: number, isActive: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.product.update({ where: { id: productId }, data: { isActive } });
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return fail("Не удалось сохранить");
  }
}

// ─── Categories ─────────────────────────────────────────────────────────────

const categorySchema = z.object({
  id: z.number().int().positive().optional(),
  key: z.string().trim().min(2).max(64).regex(/^[a-z0-9-]+$/),
  parentId: z.number().int().positive().nullable(),
  image: z.string().trim().max(512).optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  showInMenu: z.boolean(),
  translations: z.array(translationSchema).length(locales.length),
});

export type CategoryInput = z.input<typeof categorySchema>;

export async function saveCategory(input: CategoryInput): Promise<ActionResult<{ id: number }>> {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return fail("Проверьте ключ (латиница и дефисы) и названия на всех языках");
    }
    const data = parsed.data;

    if (data.id && data.parentId === data.id) return fail("Категория не может быть родителем самой себя");

    const category = data.id
      ? await db.category.update({
          where: { id: data.id },
          data: {
            key: data.key,
            parentId: data.parentId,
            image: data.image || null,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
            showInMenu: data.showInMenu,
          },
        })
      : await db.category.create({
          data: {
            key: data.key,
            parentId: data.parentId,
            image: data.image || null,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
            showInMenu: data.showInMenu,
          },
        });

    for (const translation of data.translations) {
      const slug = await uniqueCategorySlug(
        resolveSlug(translation.slug, translation.name),
        translation.locale,
        category.id,
      );
      const payload = {
        name: translation.name,
        slug,
        description: translation.description || null,
        metaTitle: translation.metaTitle || null,
        metaDescription: translation.metaDescription || null,
      };
      await db.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: category.id, locale: translation.locale } },
        create: { categoryId: category.id, locale: translation.locale, ...payload },
        update: payload,
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
    return { ok: true, data: { id: category.id } };
  } catch {
    return fail("Не удалось сохранить категорию — возможно, ключ уже занят");
  }
}

async function uniqueCategorySlug(base: string, locale: string, categoryId: number) {
  let candidate = base;
  for (let n = 2; n < 60; n += 1) {
    const clash = await db.categoryTranslation.findUnique({
      where: { locale_slug: { locale, slug: candidate } },
      select: { categoryId: true },
    });
    if (!clash || clash.categoryId === categoryId) return candidate;
    candidate = `${base}-${n}`;
  }
  return `${base}-${categoryId}`;
}

export async function deleteCategory(categoryId: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    const children = await db.category.count({ where: { parentId: categoryId } });
    if (children > 0) return fail("Сначала удалите или перенесите подкатегории");
    await db.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return fail("Не удалось удалить категорию");
  }
}

// ─── Brands ─────────────────────────────────────────────────────────────────

const brandSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(191),
  slug: z.string().trim().max(191).optional(),
  logo: z.string().trim().max(512).optional(),
  website: z.string().trim().max(512).optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  descriptions: z.array(
    z.object({
      locale: z.enum(locales),
      description: z.string().trim().max(5000).optional(),
    }),
  ),
});

export type BrandInput = z.input<typeof brandSchema>;

export async function saveBrand(input: BrandInput): Promise<ActionResult<{ id: number }>> {
  try {
    await requireAdmin();
    const parsed = brandSchema.safeParse(input);
    if (!parsed.success) return fail("Проверьте название бренда");
    const data = parsed.data;

    const slug = resolveSlug(data.slug, data.name);
    const brand = data.id
      ? await db.brand.update({
          where: { id: data.id },
          data: {
            name: data.name,
            slug,
            logo: data.logo || null,
            website: data.website || null,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        })
      : await db.brand.create({
          data: {
            name: data.name,
            slug,
            logo: data.logo || null,
            website: data.website || null,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        });

    for (const item of data.descriptions) {
      const payload = { description: item.description || null };
      await db.brandTranslation.upsert({
        where: { brandId_locale: { brandId: brand.id, locale: item.locale } },
        create: { brandId: brand.id, locale: item.locale, ...payload },
        update: payload,
      });
    }

    revalidatePath("/admin/brands");
    revalidatePath("/", "layout");
    return { ok: true, data: { id: brand.id } };
  } catch {
    return fail("Не удалось сохранить бренд — возможно, URL уже занят");
  }
}

export async function deleteBrand(brandId: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.brand.delete({ where: { id: brandId } });
    revalidatePath("/admin/brands");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return fail("Не удалось удалить бренд");
  }
}

// ─── Pages, posts, slides ───────────────────────────────────────────────────

const pageSchema = z.object({
  id: z.number().int().positive().optional(),
  key: z.string().trim().min(2).max(64).regex(/^[a-z0-9-]+$/),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  translations: z.array(
    z.object({
      locale: z.enum(locales),
      title: z.string().trim().min(1).max(255),
      slug: z.string().trim().max(255).optional(),
      content: z.string().max(200000).optional(),
      metaTitle: z.string().trim().max(255).optional(),
      metaDescription: z.string().trim().max(500).optional(),
    }),
  ).length(locales.length),
});

export type PageInput = z.input<typeof pageSchema>;

export async function savePage(input: PageInput): Promise<ActionResult<{ id: number }>> {
  try {
    await requireAdmin();
    const parsed = pageSchema.safeParse(input);
    if (!parsed.success) return fail("Заполните заголовок на всех языках");
    const data = parsed.data;

    const page = data.id
      ? await db.page.update({
          where: { id: data.id },
          data: { key: data.key, isActive: data.isActive, sortOrder: data.sortOrder },
        })
      : await db.page.create({
          data: { key: data.key, isActive: data.isActive, sortOrder: data.sortOrder },
        });

    for (const translation of data.translations) {
      const payload = {
        title: translation.title,
        slug: resolveSlug(translation.slug, translation.title),
        content: translation.content || null,
        metaTitle: translation.metaTitle || null,
        metaDescription: translation.metaDescription || null,
      };
      await db.pageTranslation.upsert({
        where: { pageId_locale: { pageId: page.id, locale: translation.locale } },
        create: { pageId: page.id, locale: translation.locale, ...payload },
        update: payload,
      });
    }

    revalidatePath("/admin/pages");
    revalidatePath("/", "layout");
    return { ok: true, data: { id: page.id } };
  } catch {
    return fail("Не удалось сохранить страницу — возможно, ключ или URL заняты");
  }
}

export async function deletePage(pageId: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.page.delete({ where: { id: pageId } });
    revalidatePath("/admin/pages");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return fail("Не удалось удалить страницу");
  }
}

const postSchema = z.object({
  id: z.number().int().positive().optional(),
  image: z.string().trim().max(512).optional(),
  isActive: z.boolean(),
  publishedAt: z.string().min(1),
  translations: z.array(
    z.object({
      locale: z.enum(locales),
      title: z.string().trim().min(1).max(255),
      slug: z.string().trim().max(255).optional(),
      excerpt: z.string().trim().max(500).optional(),
      content: z.string().max(200000).optional(),
      metaTitle: z.string().trim().max(255).optional(),
      metaDescription: z.string().trim().max(500).optional(),
    }),
  ).length(locales.length),
});

export type PostInput = z.input<typeof postSchema>;

export async function savePost(input: PostInput): Promise<ActionResult<{ id: number }>> {
  try {
    await requireAdmin();
    const parsed = postSchema.safeParse(input);
    if (!parsed.success) return fail("Заполните заголовок на всех языках");
    const data = parsed.data;

    const publishedAt = new Date(data.publishedAt);
    if (Number.isNaN(publishedAt.getTime())) return fail("Неверная дата публикации");

    const post = data.id
      ? await db.post.update({
          where: { id: data.id },
          data: { image: data.image || null, isActive: data.isActive, publishedAt },
        })
      : await db.post.create({
          data: { image: data.image || null, isActive: data.isActive, publishedAt },
        });

    for (const translation of data.translations) {
      const payload = {
        title: translation.title,
        slug: resolveSlug(translation.slug, translation.title),
        excerpt: translation.excerpt || null,
        content: translation.content || null,
        metaTitle: translation.metaTitle || null,
        metaDescription: translation.metaDescription || null,
      };
      await db.postTranslation.upsert({
        where: { postId_locale: { postId: post.id, locale: translation.locale } },
        create: { postId: post.id, locale: translation.locale, ...payload },
        update: payload,
      });
    }

    revalidatePath("/admin/posts");
    revalidatePath("/", "layout");
    return { ok: true, data: { id: post.id } };
  } catch {
    return fail("Не удалось сохранить статью — возможно, URL занят");
  }
}

export async function deletePost(postId: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.post.delete({ where: { id: postId } });
    revalidatePath("/admin/posts");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return fail("Не удалось удалить статью");
  }
}

const slideSchema = z.object({
  id: z.number().int().positive().optional(),
  image: z.string().trim().min(1).max(512),
  mobileImage: z.string().trim().max(512).optional(),
  link: z.string().trim().max(512).optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  translations: z.array(
    z.object({
      locale: z.enum(locales),
      title: z.string().trim().max(255).optional(),
      subtitle: z.string().trim().max(255).optional(),
      buttonText: z.string().trim().max(120).optional(),
    }),
  ).length(locales.length),
});

export type SlideInput = z.input<typeof slideSchema>;

export async function saveSlide(input: SlideInput): Promise<ActionResult<{ id: number }>> {
  try {
    await requireAdmin();
    const parsed = slideSchema.safeParse(input);
    if (!parsed.success) return fail("Загрузите изображение слайда");
    const data = parsed.data;

    const slide = data.id
      ? await db.slide.update({
          where: { id: data.id },
          data: {
            image: data.image,
            mobileImage: data.mobileImage || null,
            link: data.link || null,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        })
      : await db.slide.create({
          data: {
            image: data.image,
            mobileImage: data.mobileImage || null,
            link: data.link || null,
            sortOrder: data.sortOrder,
            isActive: data.isActive,
          },
        });

    for (const translation of data.translations) {
      const payload = {
        title: translation.title || null,
        subtitle: translation.subtitle || null,
        buttonText: translation.buttonText || null,
      };
      await db.slideTranslation.upsert({
        where: { slideId_locale: { slideId: slide.id, locale: translation.locale } },
        create: { slideId: slide.id, locale: translation.locale, ...payload },
        update: payload,
      });
    }

    revalidatePath("/admin/slides");
    revalidatePath("/", "layout");
    return { ok: true, data: { id: slide.id } };
  } catch {
    return fail("Не удалось сохранить слайд");
  }
}

export async function deleteSlide(slideId: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.slide.delete({ where: { id: slideId } });
    revalidatePath("/admin/slides");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return fail("Не удалось удалить слайд");
  }
}

// ─── Settings ───────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  phone: z.string().trim().min(3).max(40),
  phoneSecondary: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(191),
  address: z.string().trim().max(300),
  workingHours: z.string().trim().max(120),
  currency: z.string().trim().length(3).toUpperCase(),
  telegram: z.string().trim().max(512).optional(),
  instagram: z.string().trim().max(512).optional(),
  facebook: z.string().trim().max(512).optional(),
  youtube: z.string().trim().max(512).optional(),
});

export type SettingsInput = z.input<typeof settingsSchema>;

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return fail("Проверьте телефон, e-mail и код валюты (3 буквы)");

    const value = {
      ...parsed.data,
      phoneSecondary: parsed.data.phoneSecondary || null,
      telegram: parsed.data.telegram || null,
      instagram: parsed.data.instagram || null,
      facebook: parsed.data.facebook || null,
      youtube: parsed.data.youtube || null,
    };

    await db.setting.upsert({
      where: { key: "site" },
      create: { key: "site", value },
      update: { value },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return fail("Не удалось сохранить настройки");
  }
}
