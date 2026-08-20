import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, email: session.email });
}
