"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUSINESS } from "@/data/data";
import DateRangePicker, { DateRangeValue } from "@/components/admin/DateRangePicker";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  paymentVerificationOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingPayments: number;
  averageOrderValue: number;
}

function formatINR(n: number) {
  return `${BUSINESS.currencySymbol}${n.toLocaleString("en-IN")}`;
}

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ range: "30d" });
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dateRange.range === "custom" && (!dateRange.from || !dateRange.to)) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    const qs = new URLSearchParams({ range: dateRange.range });
    if (dateRange.from) qs.set("from", dateRange.from);
    if (dateRange.to) qs.set("to", dateRange.to);
    fetch(`/api/admin/stats?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const cards = stats
    ? [
        { label: "Total Orders", value: stats.totalOrders, href: "/admin/orders" },
        { label: "Pending Orders", value: stats.pendingOrders, href: "/admin/orders?status=pending" },
        { label: "Awaiting Verification", value: stats.paymentVerificationOrders, href: "/admin/orders?status=payment_verification" },
        { label: "Confirmed", value: stats.confirmedOrders, href: "/admin/orders?status=confirmed" },
        { label: "Completed", value: stats.completedOrders, href: "/admin/orders?status=completed" },
        { label: "Cancelled", value: stats.cancelledOrders, href: "/admin/orders?status=cancelled" },
        { label: "Customers", value: stats.totalCustomers, href: "/admin/customers" },
        { label: "Revenue Collected", value: formatINR(stats.totalRevenue), href: "/admin/orders", accent: true },
        { label: "Pending Payments", value: formatINR(stats.pendingPayments), href: "/admin/orders" },
        { label: "Avg. Order Value", value: formatINR(stats.averageOrderValue), href: "/admin/analytics" }
      ]
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <h1 className="text-[1.6rem]">Dashboard</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {loading || !stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card p-5 h-[92px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="card p-5 hover:shadow-[0_6px_20px_rgba(64,51,42,0.08)] transition-shadow">
              <div className="text-[0.78rem] text-text-muted mb-1.5">{c.label}</div>
              <div className={`font-serif text-[1.5rem] font-bold ${c.accent ? "text-gold-dark" : "text-ink"}`}>{c.value}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <Link href="/admin/orders" className="card p-6 hover:shadow-[0_6px_20px_rgba(64,51,42,0.08)] transition-shadow">
          <h3 className="text-[1.1rem] mb-1.5">Manage Orders</h3>
          <p className="text-text-muted text-[0.88rem] m-0">Review new orders, verify payments, and update order status.</p>
        </Link>
        <Link href="/admin/products" className="card p-6 hover:shadow-[0_6px_20px_rgba(64,51,42,0.08)] transition-shadow">
          <h3 className="text-[1.1rem] mb-1.5">Manage Products</h3>
          <p className="text-text-muted text-[0.88rem] m-0">Add cakes, update prices, and control what&apos;s visible on the site.</p>
        </Link>
        <Link href="/admin/analytics" className="card p-6 hover:shadow-[0_6px_20px_rgba(64,51,42,0.08)] transition-shadow">
          <h3 className="text-[1.1rem] mb-1.5">View Analytics</h3>
          <p className="text-text-muted text-[0.88rem] m-0">Revenue trends, top products and category performance.</p>
        </Link>
        <Link href="/admin/customers" className="card p-6 hover:shadow-[0_6px_20px_rgba(64,51,42,0.08)] transition-shadow">
          <h3 className="text-[1.1rem] mb-1.5">View Customers</h3>
          <p className="text-text-muted text-[0.88rem] m-0">Order history, spending and notes for every customer.</p>
        </Link>
      </div>
    </div>
  );
}
