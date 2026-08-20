import { NextRequest, NextResponse } from "next/server";
import { findAdminByEmail, countAdmins } from "@/lib/adminStore";
import { verifyPassword } from "@/lib/adminPassword";
import { createSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";

// Slows down brute-force guessing without needing external infra — fine at single-admin scale.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const { email, password, rememberMe } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (rateLimited(`${ip}:${String(email).toLowerCase()}`)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  if ((await countAdmins()) === 0) {
    return NextResponse.json({ error: "No admin account exists yet. Complete setup first." }, { status: 404 });
  }

  const admin = await findAdminByEmail(email);
  const valid = admin ? await verifyPassword(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days vs 1 day
  const token = await createSessionToken({ adminId: admin.id, email: admin.email }, maxAge);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge
  });
  return res;
}
