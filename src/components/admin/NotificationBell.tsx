"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function load() {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }

  useEffect(() => {
    Promise.resolve().then(load);
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/admin/notifications/${id}/read`, { method: "POST" });
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch("/api/admin/notifications/mark-all-read", { method: "POST" });
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-[1.05rem]"
        style={{ background: "var(--blush-soft)" }}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[0.62rem] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-h-[420px] overflow-y-auto rounded-[14px] border border-border shadow-[0_20px_50px_rgba(64,51,42,0.15)] bg-white z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-white">
            <span className="font-semibold text-[0.92rem] text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[0.76rem] text-gold-dark font-medium">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-text-muted text-[0.85rem] text-center py-8 px-4">No notifications yet.</p>
          ) : (
            notifications.map((n) => {
              const content = (
                <div
                  className={`px-4 py-3 border-b border-border last:border-0 ${n.read ? "" : "bg-blush-soft"}`}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[0.86rem] font-semibold text-ink">{n.title}</span>
                    <span className="text-[0.7rem] text-text-muted flex-shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-[0.8rem] text-text-muted m-0 mt-1">{n.message}</p>
                </div>
              );
              return n.orderId ? (
                <Link key={n.id} href={`/admin/orders/${n.orderId}`} className="block cursor-pointer hover:bg-blush-soft/60" onClick={() => setOpen(false)}>
                  {content}
                </Link>
              ) : (
                <div key={n.id} className="cursor-pointer hover:bg-blush-soft/60">
                  {content}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
