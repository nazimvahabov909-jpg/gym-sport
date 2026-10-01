import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

const [key, image] = process.argv.slice(2);

async function main() {
  if (key && image) {
    await db.category.updateMany({ where: { key }, data: { image } });
    console.log(`set ${key} -> ${image}`);
    return;
  }
  const rows = await db.category.findMany({
    where: { parentId: null },
    select: { key: true, image: true },
  });
  console.table(rows);

  const strength = await db.productImage.findMany({
    where: { product: { categories: { some: { category: { parent: { key: "strength" } } } } } },
    take: 8,
    select: { url: true, product: { select: { translations: { where: { locale: "ru" }, select: { name: true } } } } },
  });
  console.log(strength.map((s) => `${s.url}  ${s.product.translations[0]?.name}`).join("\n"));
}

main().finally(() => db.$disconnect());
