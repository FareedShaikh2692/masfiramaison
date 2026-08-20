"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUSINESS } from "@/data/data";
import DateRangePicker, { DateRangeValue } from "@/components/admin/DateRangePicker";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import { CardGridSkeleton } from "@/components/admin/Skeleton";
import {
  ShoppingBag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  XCircle,
  Users,
  Wallet,
  CreditCard,
  TrendingUp,
  BarChart3,
  Cake
} from "lucide-react";

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
        { label: "Total Orders", value: String(stats.totalOrders), href: "/admin/orders", icon: ShoppingBag },
        { label: "Pending Orders", value: String(stats.pendingOrders), href: "/admin/orders?status=pending", icon: Clock },
        { label: "Awaiting Verification", value: String(stats.paymentVerificationOrders), href: "/admin/orders?status=payment_verification", icon: ShieldCheck },
        { label: "Confirmed", value: String(stats.confirmedOrders), href: "/admin/orders?status=confirmed", icon: CheckCircle2 },
        { label: "Completed", value: String(stats.completedOrders), href: "/admin/orders?status=completed", icon: PackageCheck },
        { label: "Cancelled", value: String(stats.cancelledOrders), href: "/admin/orders?status=cancelled", icon: XCircle },
        { label: "Customers", value: String(stats.totalCustomers), href: "/admin/customers", icon: Users },
        { label: "Revenue Collected", value: formatINR(stats.totalRevenue), href: "/admin/orders", icon: Wallet },
        { label: "Pending Payments", value: formatINR(stats.pendingPayments), href: "/admin/payments?paymentStatus=pending", icon: CreditCard },
        { label: "Avg. Order Value", value: formatINR(stats.averageOrderValue), href: "/admin/analytics", icon: TrendingUp }
      ]
    : [];

  const quickLinks = [
    { href: "/admin/orders", title: "Manage Orders", description: "Review new orders, verify payments, and update order status.", icon: ShoppingBag },
    { href: "/admin/products", title: "Manage Products", description: "Add cakes, update prices, and control what's visible on the site.", icon: Cake },
    { href: "/admin/analytics", title: "View Analytics", description: "Revenue trends, top products and category performance.", icon: BarChart3 },
    { href: "/admin/customers", title: "View Customers", description: "Order history, spending and notes for every customer.", icon: Users }
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="An overview of Masfira Maison's orders, revenue and customers." actions={<DateRangePicker value={dateRange} onChange={setDateRange} />} />

      {loading || !stats ? (
        <CardGridSkeleton count={10} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <Link key={c.label} href={c.href}>
              <StatCard icon={c.icon} label={c.label} value={c.value} />
            </Link>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {quickLinks.map((q) => (
          <Link key={q.href} href={q.href} className="card p-6 hover:shadow-[0_6px_20px_rgba(64,51,42,0.08)] transition-shadow">
            <span className="w-9 h-9 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--blush-soft)" }}>
              <q.icon size={17} color="var(--gold-dark)" />
            </span>
            <h3 className="admin-section-title mb-1.5">{q.title}</h3>
            <p className="text-text-muted text-[0.88rem] m-0">{q.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
