import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";
import { findAdminById, updateAdminPassword } from "@/lib/adminStore";
import { hashPassword, verifyPassword } from "@/lib/adminPassword";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "Current password and a new password of at least 8 characters are required." }, { status: 400 });
  }

  const admin = await findAdminById(session.adminId);
  if (!admin) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

  const passwordHash = await hashPassword(newPassword);
  await updateAdminPassword(admin.id, passwordHash);

  return NextResponse.json({ ok: true });
}
