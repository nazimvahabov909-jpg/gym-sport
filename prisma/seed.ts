/**
 * Seeds everything the catalogue import does not cover: the admin account,
 * site settings, static pages, home slides, blog posts and brand logos.
 *
 *   npm run db:seed
 */
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { LOCALES, type Locale } from "../scripts/data/catalog-i18n";
import {
  BRAND_LOGOS,
  CATEGORY_IMAGES,
  PAGES,
  POSTS,
  SLIDES,
} from "./seed-content";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

async function seedSettings() {
  const value = {
    phone: "+998 98 128 01 28",
    phoneSecondary: null,
    email: "info@unitedsport.az",
    address: "Toshkent, O‘zbekiston",
    workingHours: "Пн–Сб 09:00 – 18:00",
    currency: "UZS",
    telegram: null,
    instagram: null,
    facebook: null,
    youtube: null,
  };
  await db.setting.upsert({
    where: { key: "site" },
    create: { key: "site", value },
    update: {},
  });
  console.log("✓ settings");
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@unitedsport.uz";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`· admin ${email} already exists`);
    return;
  }
  await db.adminUser.create({
    data: {
      email,
      name: "Administrator",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  console.log(`✓ admin ${email} / ${password}`);
}

async function seedBrandLogos() {
  for (const [slug, logo] of Object.entries(BRAND_LOGOS)) {
    await db.brand.updateMany({ where: { slug }, data: { logo } });
  }
  console.log("✓ brand logos");
}

async function seedCategoryImages() {
  for (const [key, image] of Object.entries(CATEGORY_IMAGES)) {
    await db.category.updateMany({ where: { key }, data: { image } });
  }

  // Anything still without a picture borrows one from a product in its branch,
  // so the catalogue never shows an empty grey tile.
  const categories = await db.category.findMany({
    select: { id: true, parentId: true, image: true },
    orderBy: { sortOrder: "asc" },
  });
  const descendants = (id: number): number[] => {
    const kids = categories.filter((c) => c.parentId === id).map((c) => c.id);
    return [id, ...kids.flatMap(descendants)];
  };

  let filled = 0;
  for (const category of categories) {
    if (category.image) continue;
    const image = await db.productImage.findFirst({
      where: { product: { categories: { some: { categoryId: { in: descendants(category.id) } } } } },
      orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
      select: { url: true },
    });
    if (!image) continue;
    await db.category.update({ where: { id: category.id }, data: { image: image.url } });
    filled += 1;
  }
  console.log(`✓ category images (${filled} from products)`);
}

async function seedPages() {
  for (const page of PAGES) {
    const row = await db.page.upsert({
      where: { key: page.key },
      create: { key: page.key, sortOrder: page.sortOrder },
      update: { sortOrder: page.sortOrder },
    });
    for (const locale of LOCALES) {
      const data = {
        title: page.title[locale],
        slug: page.slug[locale],
        content: page.content[locale],
        metaTitle: `${page.title[locale]} — United Sport`,
        metaDescription: page.content[locale]
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 200),
      };
      await db.pageTranslation.upsert({
        where: { pageId_locale: { pageId: row.id, locale } },
        create: { pageId: row.id, locale, ...data },
        update: data,
      });
    }
  }
  console.log(`✓ pages: ${PAGES.length}`);
}

async function seedSlides() {
  const existing = await db.slide.count();
  if (existing > 0) {
    console.log(`· slides already seeded (${existing})`);
    return;
  }
  for (const [i, slide] of SLIDES.entries()) {
    const row = await db.slide.create({
      data: { image: slide.image, link: slide.link, sortOrder: i * 10 },
    });
    for (const locale of LOCALES) {
      await db.slideTranslation.create({
        data: {
          slideId: row.id,
          locale,
          title: slide.title[locale],
          subtitle: slide.subtitle[locale],
          buttonText: slide.button[locale],
        },
      });
    }
  }
  console.log(`✓ slides: ${SLIDES.length}`);
}

async function seedPosts() {
  for (const post of POSTS) {
    const publishedAt = new Date(Date.now() - post.daysAgo * 86_400_000);
    // Posts have no natural key, so match on the Russian slug.
    const existing = await db.postTranslation.findUnique({
      where: { locale_slug: { locale: "ru" as Locale, slug: post.slug.ru } },
      select: { postId: true },
    });
    const row = existing
      ? await db.post.update({ where: { id: existing.postId }, data: { image: post.image } })
      : await db.post.create({ data: { image: post.image, publishedAt } });

    for (const locale of LOCALES) {
      const data = {
        title: post.title[locale],
        slug: post.slug[locale],
        excerpt: post.excerpt[locale],
        content: post.content[locale],
        metaTitle: `${post.title[locale]} — United Sport`,
        metaDescription: post.excerpt[locale],
      };
      await db.postTranslation.upsert({
        where: { postId_locale: { postId: row.id, locale } },
        create: { postId: row.id, locale, ...data },
        update: data,
      });
    }
  }
  console.log(`✓ posts: ${POSTS.length}`);
}

async function main() {
  await seedSettings();
  await seedAdmin();
  await seedBrandLogos();
  await seedCategoryImages();
  await seedPages();
  await seedSlides();
  await seedPosts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
