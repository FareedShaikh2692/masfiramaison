import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";
import AdminShell from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata: Metadata = {
  title: "Admin Dashboard | Masfira Maison",
  robots: { index: false, follow: false }
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Middleware already enforces auth for this route tree — session is only
  // absent here in the instant between an expired cookie and the next
  // request, so this is a fallback label, not the primary access control.
  const email = session?.email || "";

  return (
    <ToastProvider>
      <AdminShell email={email}>{children}</AdminShell>
    </ToastProvider>
  );
}
