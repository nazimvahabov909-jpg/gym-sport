/**
 * Removes the rows the end-to-end scripts leave behind.
 *   npx tsx scripts/dev/clean-test-data.ts
 */
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });

const E2E_PHONE = "+998901234567";

async function main() {
  const orders = await db.order.deleteMany({ where: { phone: E2E_PHONE } });
  const leads = await db.lead.deleteMany({ where: { phone: E2E_PHONE } });
  // Carts nobody has touched for a day are abandoned; they only hold cookies.
  const carts = await db.cart.deleteMany({
    where: { customerId: null, updatedAt: { lt: new Date(Date.now() - 86_400_000) } },
  });

  console.log(`orders: ${orders.count}, leads: ${leads.count}, stale carts: ${carts.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
