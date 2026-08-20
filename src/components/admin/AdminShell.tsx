"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>
      <aside className="hidden md:block w-[248px] flex-shrink-0 border-r border-border">
        <div className="fixed w-[248px] h-screen">
          <AdminSidebar />
        </div>
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[1000]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] shadow-xl">
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar email={email} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
