"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUSINESS } from "@/data/data";
import { formatDate } from "@/lib/format";
import SortableTh from "@/components/admin/SortableTh";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import StatusBadge, { type BadgeTone } from "@/components/admin/StatusBadge";
import { Users } from "lucide-react";

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

const STATUS_TONE: Record<string, BadgeTone> = { active: "gold", new: "success", lapsed: "neutral" };

type SortKey = "name" | "totalOrders" | "totalSpent" | "lastOrderDate";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastOrderDate");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? 1 : -1);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      fetch("/api/admin/customers")
        .then((r) => r.json())
        .then((data) => setCustomers(data.customers || []))
        .finally(() => setLoading(false));
    });
  }, []);

  const filtered = customers
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * sortDir;
      return ((av as number) - (bv as number)) * sortDir;
    });

  return (
    <div>
      <PageHeader title="Customers" description="Order history, spending and notes for every customer." />

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
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={customers.length === 0 ? "No Customers Yet" : "No Matches"}
          description={customers.length === 0 ? "Customers will show up here after their first order." : "No customers match your search."}
        />
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {filtered.map((c) => (
              <Link key={c.phone} href={`/admin/customers/${encodeURIComponent(c.phone)}`} className="card p-4 block">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-medium text-ink">{c.name}</span>
                  <span className="flex-shrink-0"><StatusBadge label={c.status} tone={STATUS_TONE[c.status]} /></span>
                </div>
                <div className="text-text-muted text-[0.8rem] mb-2">{c.phone}</div>
                <div className="flex items-center justify-between text-[0.85rem]">
                  <span className="text-text-muted">{c.totalOrders} orders · {formatDate(c.lastOrderDate.slice(0, 10))}</span>
                  <span className="text-ink font-semibold">{BUSINESS.currencySymbol}{c.totalSpent.toLocaleString("en-IN")}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="hidden sm:block card overflow-x-auto">
            <table className="w-full text-[0.86rem]">
              <thead>
                <tr className="border-b border-border text-left text-text-muted text-[0.72rem] uppercase tracking-wide">
                  <SortableTh label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <SortableTh label="Orders" active={sortKey === "totalOrders"} dir={sortDir} onClick={() => toggleSort("totalOrders")} />
                  <SortableTh label="Total Spent" active={sortKey === "totalSpent"} dir={sortDir} onClick={() => toggleSort("totalSpent")} />
                  <SortableTh label="Last Order" active={sortKey === "lastOrderDate"} dir={sortDir} onClick={() => toggleSort("lastOrderDate")} />
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
                      <StatusBadge label={c.status} tone={STATUS_TONE[c.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
