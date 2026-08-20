"use client";

import { Suspense } from "react";
import { PanelLeft, Menu } from "lucide-react";
import NotificationBell from "@/components/admin/NotificationBell";
import ProfileMenu from "@/components/admin/ProfileMenu";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import GlobalSearch from "@/components/admin/GlobalSearch";

export default function AdminTopbar({
  email,
  onMenuClick,
  collapsed,
  onToggleCollapsed
}: {
  email: string;
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 px-5 md:px-8 py-3.5 border-b border-border" style={{ background: "rgba(255,253,249,0.92)", backdropFilter: "blur(8px)" }}>
      <button onClick={onMenuClick} aria-label="Open menu" className="md:hidden w-9 h-9 flex items-center justify-center flex-shrink-0">
        <Menu size={20} className="text-ink" />
      </button>

      <button
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden md:flex w-9 h-9 items-center justify-center rounded-[8px] hover:bg-blush-soft transition-colors flex-shrink-0"
      >
        <PanelLeft size={17} className="text-text-muted" />
      </button>

      <div className="hidden sm:block flex-shrink-0">
        <Suspense fallback={null}>
          <Breadcrumbs />
        </Suspense>
      </div>

      <div className="flex-1 flex justify-end md:justify-center">
        <Suspense fallback={null}>
          <GlobalSearch />
        </Suspense>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <NotificationBell />
        <ProfileMenu email={email} />
      </div>
    </header>
  );
}
