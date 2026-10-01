import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../src/generated/prisma/client";

function poolConfig(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    connectionLimit: 5,
    acquireTimeout: 60_000,
    connectTimeout: 20_000,
    idleTimeout: 60,
  };
}

async function main() {
  const url = process.env.DATABASE_URL!;
  const cfg = poolConfig(url);
  console.log("parsed config:", { ...cfg, password: "***" });

  const db = new PrismaClient({ adapter: new PrismaMariaDb(cfg) });
  const started = Date.now();
  try {
    const n = await db.product.count();
    console.log(`✓ pool config işləyir — ${n} məhsul, ${Date.now() - started}ms`);
  } catch (e) {
    console.log(`✗ pool config XƏTA (${Date.now() - started}ms):`, (e as Error).message.slice(0, 300));
  } finally {
    await db.$disconnect();
  }

  // Control: the plain connection-string form that worked before.
  const db2 = new PrismaClient({ adapter: new PrismaMariaDb(url) });
  const t2 = Date.now();
  try {
    const n = await db2.product.count();
    console.log(`✓ connection-string forması işləyir — ${n} məhsul, ${Date.now() - t2}ms`);
  } catch (e) {
    console.log(`✗ connection-string XƏTA:`, (e as Error).message.slice(0, 200));
  } finally {
    await db2.$disconnect();
  }

}

main();
