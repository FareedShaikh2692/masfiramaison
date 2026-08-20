"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BUSINESS } from "@/data/data";
import DateRangePicker, { DateRangeValue } from "@/components/admin/DateRangePicker";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/admin/PageHeader";

interface AnalyticsData {
  series: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; orders: number; revenue: number }[];
  categoryPerformance: { name: string; orders: number; revenue: number }[];
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

function formatINR(n: number) {
  return `${BUSINESS.currencySymbol}${n.toLocaleString("en-IN")}`;
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({ range: "30d" });
  const [data, setData] = useState<AnalyticsData | null>(null);
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
    fetch(`/api/admin/analytics?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  return (
    <div>
      <PageHeader title="Analytics" description="Revenue trends, top products, and category performance." actions={<DateRangePicker value={dateRange} onChange={setDateRange} />} />

      {loading || !data ? (
        <div className="space-y-5">
          <div className="card h-72 animate-pulse" />
          <div className="card h-64 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="text-[0.78rem] text-text-muted mb-1.5">Orders</div>
              <div className="font-serif text-[1.5rem] font-bold text-ink">{data.totalOrders}</div>
            </div>
            <div className="card p-5">
              <div className="text-[0.78rem] text-text-muted mb-1.5">Revenue Collected</div>
              <div className="font-serif text-[1.5rem] font-bold text-gold-dark">{formatINR(data.totalRevenue)}</div>
            </div>
            <div className="card p-5">
              <div className="text-[0.78rem] text-text-muted mb-1.5">Avg. Order Value</div>
              <div className="font-serif text-[1.5rem] font-bold text-ink">{formatINR(data.avgOrderValue)}</div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-[1.05rem] mb-4">Revenue Over Time</h3>
            {data.series.length === 0 ? (
              <p className="text-text-muted text-[0.88rem]">No orders in this range yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tickFormatter={(d) => formatDate(d).slice(0, 6)} fontSize={12} stroke="var(--text-muted)" />
                  <YAxis fontSize={12} stroke="var(--text-muted)" />
                  <Tooltip labelFormatter={(d) => formatDate(String(d))} formatter={(v) => [`₹${v}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--gold-dark)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-[1.05rem] mb-4">Orders Per Day</h3>
            {data.series.length === 0 ? (
              <p className="text-text-muted text-[0.88rem]">No orders in this range yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tickFormatter={(d) => formatDate(d).slice(0, 6)} fontSize={12} stroke="var(--text-muted)" />
                  <YAxis fontSize={12} allowDecimals={false} stroke="var(--text-muted)" />
                  <Tooltip labelFormatter={(d) => formatDate(String(d))} />
                  <Bar dataKey="orders" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="card p-6">
              <h3 className="text-[1.05rem] mb-4">Most Popular Products</h3>
              {data.topProducts.length === 0 ? (
                <p className="text-text-muted text-[0.88rem]">No orders yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.topProducts.map((p) => (
                    <div key={p.name} className="flex justify-between text-[0.88rem] py-1.5 border-b border-dashed border-border last:border-0">
                      <span className="text-ink">{p.name}</span>
                      <span className="text-text-muted">{p.orders} orders</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card p-6">
              <h3 className="text-[1.05rem] mb-4">Category Performance</h3>
              {data.categoryPerformance.length === 0 ? (
                <p className="text-text-muted text-[0.88rem]">No orders yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.categoryPerformance.map((c) => (
                    <div key={c.name} className="flex justify-between text-[0.88rem] py-1.5 border-b border-dashed border-border last:border-0">
                      <span className="text-ink">{c.name}</span>
                      <span className="text-text-muted">{formatINR(c.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
