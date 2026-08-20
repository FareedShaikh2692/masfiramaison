import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_API_PATHS = ["/api/admin/auth/login", "/api/admin/auth/setup", "/api/admin/auth/logout", "/api/admin/auth/me"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicAdminPage = PUBLIC_ADMIN_PATHS.some((p) => pathname === p);
  const isPublicApi = PUBLIC_API_PATHS.some((p) => pathname === p);
  if (isPublicAdminPage || isPublicApi) return NextResponse.next();

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
