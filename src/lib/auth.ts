import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "comidaya_session";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch {
    return false;
  }
}

export async function setSession(restaurantId: string, slug: string) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({
    restaurantId,
    slug,
    createdAt: Date.now(),
  });
  const encoded = Buffer.from(sessionData).toString("base64");

  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
}

export async function getSession(): Promise<{ restaurantId: string; slug: string } | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const decoded = Buffer.from(cookie.value, "base64").toString("utf-8");
    const session = JSON.parse(decoded);
    return session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentRestaurant() {
  const session = await getSession();
  if (!session) return null;

  return await prisma.restaurant.findUnique({
    where: { id: session.restaurantId },
  });
}
