"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Store, LogOut, ChevronDown } from "lucide-react";

export default function ProfileMenu({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const initial = (email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={rootRef}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-blush-soft transition-colors">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-[0.82rem] flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))" }}
        >
          {initial}
        </span>
        <span className="text-[0.84rem] text-ink font-medium hidden sm:inline max-w-[140px] truncate">{email}</span>
        <ChevronDown size={14} className="text-text-muted hidden sm:inline flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[220px] rounded-[12px] border border-border shadow-[0_20px_50px_rgba(64,51,42,0.15)] bg-white z-50 py-1.5">
          <div className="px-4 py-2 border-b border-border mb-1">
            <div className="text-[0.8rem] font-medium text-ink truncate">{email}</div>
            <div className="admin-caption">Administrator</div>
          </div>
          <Link href="/admin/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-[0.85rem] text-ink hover:bg-blush-soft/60">
            <User size={15} /> My Profile
          </Link>
          <Link href="/admin/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-[0.85rem] text-ink hover:bg-blush-soft/60">
            <Store size={15} /> Business Settings
          </Link>
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[0.85rem] text-danger hover:bg-blush-soft/60 text-left"
            >
              <LogOut size={15} /> {loggingOut ? "Logging out…" : "Log Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
