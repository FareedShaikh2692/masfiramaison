import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

/**
 * Node-only (uses `crypto`) — import this from API routes (Node runtime),
 * never from middleware.ts or anything else that might run at the Edge.
 * Session verification lives in adminSession.ts instead, which is Edge-safe.
 */

const scryptAsync = promisify(scrypt);

/** Scrypt password hashing (Node's built-in, no native bindings) — format: `salt:hash`, both hex. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hashHex, "hex");
  if (derived.length !== storedBuf.length) return false;
  return timingSafeEqual(derived, storedBuf);
}
