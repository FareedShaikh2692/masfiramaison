"use client";

import { Suspense, useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminFooter from "@/components/admin/AdminFooter";

const COLLAPSE_KEY = "admin-sidebar-collapsed";

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1"));
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const sidebarWidth = collapsed ? 76 : 248;

  return (
    <div className="admin-shell min-h-screen flex" style={{ background: "var(--cream)" }}>
      <aside className="hidden md:block flex-shrink-0 border-r border-border transition-[width] duration-200" style={{ width: sidebarWidth }}>
        <div className="fixed h-screen transition-[width] duration-200" style={{ width: sidebarWidth }}>
          <Suspense fallback={null}>
            <AdminSidebar collapsed={collapsed} />
          </Suspense>
        </div>
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[1000]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] shadow-xl">
            <Suspense fallback={null}>
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </Suspense>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar email={email} onMenuClick={() => setMobileOpen(true)} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <main className="flex-1 p-5 md:p-8">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
