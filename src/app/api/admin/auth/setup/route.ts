import { NextRequest, NextResponse } from "next/server";
import { countAdmins, createAdmin } from "@/lib/adminStore";
import { hashPassword } from "@/lib/adminPassword";

/**
 * One-time bootstrap for the very first admin account. Gated by two checks:
 * `ADMIN_SETUP_SECRET` must match (set once, then safe to remove/rotate),
 * and it refuses to run at all once any admin already exists — so it can't
 * be used to add a second, unauthorized admin later even if the secret leaks.
 */
export async function POST(req: NextRequest) {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json({ error: "Setup is not enabled." }, { status: 404 });
  }

  const { email, password, secret } = await req.json();

  if (secret !== setupSecret) {
    return NextResponse.json({ error: "Invalid setup secret." }, { status: 401 });
  }
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "A valid email and a password of at least 8 characters are required." }, { status: 400 });
  }
  if ((await countAdmins()) > 0) {
    return NextResponse.json({ error: "An admin account already exists — setup is locked." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const admin = await createAdmin(email, passwordHash);
  return NextResponse.json({ ok: true, email: admin.email });
}
