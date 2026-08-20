"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminTopbar({ email, onMenuClick }: { email: string; onMenuClick: () => void }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-4 px-5 md:px-8 py-4 border-b border-border" style={{ background: "var(--ivory)" }}>
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="md:hidden flex flex-col gap-1.5 p-2 -ml-2"
      >
        <span className="w-5 h-0.5 bg-ink rounded" />
        <span className="w-5 h-0.5 bg-ink rounded" />
        <span className="w-5 h-0.5 bg-ink rounded" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <span className="text-[0.86rem] text-text-muted hidden sm:inline">{email}</span>
        <button onClick={handleLogout} disabled={loggingOut} className="btn btn-outline btn-sm">
          {loggingOut ? "Logging out…" : "Log Out"}
        </button>
      </div>
    </header>
  );
}
