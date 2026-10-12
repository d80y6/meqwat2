import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

// Native PBKDF2 Hashing for zero external dependency & ultra-reliability
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, hash] = storedHash.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return testHash === hash;
}

// Simple secure session token signed with a server secret
const SESSION_SECRET = process.env.SESSION_SECRET || "meqwat-secret-key-32-chars-at-least-safely-stored";

export function signToken(payload: any): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const cipher = crypto.createCipheriv("aes-256-cbc", crypto.scryptSync(SESSION_SECRET, "salt", 32), Buffer.alloc(16));
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function verifyToken(token: string): any | null {
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", crypto.scryptSync(SESSION_SECRET, "salt", 32), Buffer.alloc(16));
    let decrypted = decipher.update(token, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const payload = JSON.parse(decrypted);
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

export interface SessionData {
  userId: number;
  tenantId: number;
  role: "admin" | "manager" | "cashier";
  username: string;
  name: string;
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("meqwat_session")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (e) {
    return null;
  }
}

export async function setSession(data: SessionData) {
  const token = signToken(data);
  const cookieStore = await cookies();
  cookieStore.set("meqwat_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("meqwat_session");
}
