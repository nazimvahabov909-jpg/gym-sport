import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const CUSTOMER_COOKIE = "us_session";
const ADMIN_COOKIE = "us_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short (needs 16+ characters)");
  }
  return new TextEncoder().encode(value);
}

type SessionKind = "customer" | "admin";

async function sign(kind: SessionKind, id: number) {
  return new SignJWT({ kind, id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

async function read(kind: SessionKind): Promise<number | null> {
  const jar = await cookies();
  const token = jar.get(kind === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== kind || typeof payload.id !== "number") return null;
    return payload.id;
  } catch {
    return null;
  }
}

async function setCookie(kind: SessionKind, id: number) {
  const jar = await cookies();
  jar.set(kind === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE, await sign(kind, id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// ─── Customer ───────────────────────────────────────────────────────────────

export async function startCustomerSession(customerId: number) {
  await setCookie("customer", customerId);
}

export async function endCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export const getCurrentCustomer = cache(async () => {
  const id = await read("customer");
  if (!id) return null;
  const customer = await db.customer.findFirst({
    where: { id, isActive: true },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true },
  });
  return customer;
});

// ─── Admin ──────────────────────────────────────────────────────────────────

export async function startAdminSession(adminId: number) {
  await setCookie("admin", adminId);
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export const getCurrentAdmin = cache(async () => {
  const id = await read("admin");
  if (!id) return null;
  return db.adminUser.findFirst({
    where: { id, isActive: true },
    select: { id: true, email: true, name: true, role: true },
  });
});
