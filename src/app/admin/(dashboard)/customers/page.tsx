"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUSINESS } from "@/data/data";
import { formatDate } from "@/lib/format";

interface CustomerSummary {
  phone: string;
  name: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  favoriteProduct: string | null;
  status: "active" | "new" | "lapsed";
}

const STATUS_COLOR: Record<string, string> = { active: "var(--gold-dark)", new: "#5A7D5A", lapsed: "#9A8C7A" };

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    Promise.resolve().then(() => {
      fetch("/api/admin/customers")
        .then((r) => r.json())
        .then((data) => setCustomers(data.customers || []))
        .finally(() => setLoading(false));
    });
  }, []);

  const filtered = customers.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-[1.6rem] mb-6">Customers</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input className="field-input max-w-[260px]" placeholder="Search name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="field-input max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Customers</option>
          <option value="new">New</option>
          <option value="active">Active</option>
          <option value="lapsed">Lapsed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-14 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-text-muted">{customers.length === 0 ? "No customers yet — they'll show up here after the first order." : "No customers match your search."}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[0.86rem]">
            <thead>
              <tr className="border-b border-border text-left text-text-muted text-[0.72rem] uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Total Spent</th>
                <th className="px-5 py-3 font-medium">Last Order</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.phone} className="border-b border-border last:border-0 cursor-pointer hover:bg-blush-soft/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/customers/${encodeURIComponent(c.phone)}`} className="font-medium text-ink hover:text-gold-dark">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-text-muted">{c.phone}</td>
                  <td className="px-5 py-3 text-ink">{c.totalOrders}</td>
                  <td className="px-5 py-3 text-ink">{BUSINESS.currencySymbol}{c.totalSpent.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-text-muted">{formatDate(c.lastOrderDate.slice(0, 10))}</td>
                  <td className="px-5 py-3">
                    <span className="text-[0.72rem] px-2.5 py-1 rounded-full font-medium text-white capitalize" style={{ background: STATUS_COLOR[c.status] }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
