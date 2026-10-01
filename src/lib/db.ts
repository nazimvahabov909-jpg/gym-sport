import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Next dev reloads modules on every edit; without the global cache each reload
 * would open a fresh MySQL pool until the server runs out of connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * The adapter takes either a connection string or a pool config, not both, so
 * the URL is parsed here to attach pool limits.
 *
 * Prerendering renders many pages at once across several workers. With the
 * driver's 10s default the queue outruns the timeout and pages fail with
 * "pool timeout", so the wait is generous while the pool itself stays small —
 * shared MySQL plans cap total connections quite low.
 */
function poolConfig(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 5),
    acquireTimeout: 60_000,
    connectTimeout: 20_000,
    // Reconnect rather than serve an error after an idle disconnect.
    idleTimeout: 60,
  };
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({
    adapter: new PrismaMariaDb(poolConfig(url)),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
