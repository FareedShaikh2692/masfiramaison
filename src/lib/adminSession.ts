import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe: only jose (no Node `crypto`), so this is fine to import from
 * middleware.ts, which runs in the Edge Runtime. Password hashing lives in
 * adminPassword.ts instead — Node's `crypto` module isn't available at the
 * Edge, and importing it from a file middleware pulls in breaks that route
 * (Next bundles the whole module, not just the functions actually called).
 */

const SESSION_COOKIE = "masfira_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set.");
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSession {
  adminId: string;
  email: string;
}

export async function createSessionToken(session: AdminSession, maxAgeSeconds = SESSION_DURATION_SECONDS): Promise<string> {
  return new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.adminId)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { adminId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE;
export const ADMIN_SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
