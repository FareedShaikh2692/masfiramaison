"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { OrderRecord } from "@/lib/types";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";
import SortableTh from "@/components/admin/SortableTh";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge, { type BadgeTone } from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { ShoppingBag } from "lucide-react";

const STATUS_OPTIONS = ["all", ...Object.keys(ORDER_STATUS_LABEL)];

type SortKey = "preferredDate" | "total";

function OrdersList() {
  const router = useRouter();
  const params = useSearchParams();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("preferredDate");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const status = params.get("status") || "all";
  const pageSize = 20;

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  }


  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ status, page: String(page), pageSize: String(pageSize) });
    if (search) qs.set("search", search);
    const res = await fetch(`/api/admin/orders?${qs}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [status, page, search]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  function setStatus(next: string) {
    setPage(1);
    router.push(next === "all" ? "/admin/orders" : `/admin/orders?status=${next}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const sortedOrders = orders.slice().sort((a, b) => {
    if (sortKey === "total") return ((a.total ?? 0) - (b.total ?? 0)) * sortDir;
    return a.preferredDate.localeCompare(b.preferredDate) * sortDir;
  });

  return (
    <div>
      <PageHeader title="Orders" description="Review new orders, verify payments, and update order status." />

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="field-input max-w-[260px]"
          placeholder="Search order ID, name, phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select className="field-input max-w-[220px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No Orders Yet" description="Your orders will appear here when customers place their first order." />
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {sortedOrders.map((o) => (
              <div
                key={o.orderId}
                className="card p-4 cursor-pointer"
                onClick={() => router.push(`/admin/orders/${o.orderId}`)}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-semibold text-gold-dark">{o.orderId}</span>
                  <StatusBadge label={ORDER_STATUS_LABEL[o.status]} tone={statusTone(o.status)} />
                </div>
                <div className="text-ink font-medium">{o.fullName}</div>
                <div className="text-text-muted text-[0.8rem] mb-2">{o.phone} · {o.productName}</div>
                <div className="flex items-center justify-between text-[0.85rem]">
                  <span className="text-text-muted">{formatDate(o.preferredDate)}</span>
                  <span className="text-ink font-semibold">{o.total != null ? `₹${o.total}` : "—"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block card overflow-x-auto">
            <table className="w-full text-[0.86rem]">
              <thead>
                <tr className="border-b border-border text-left text-text-muted text-[0.72rem] uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <SortableTh label="Date" active={sortKey === "preferredDate"} dir={sortDir} onClick={() => toggleSort("preferredDate")} />
                  <SortableTh label="Amount" active={sortKey === "total"} dir={sortDir} onClick={() => toggleSort("total")} />
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((o) => (
                  <tr
                    key={o.orderId}
                    className="border-b border-border last:border-0 cursor-pointer hover:bg-blush-soft/40"
                    onClick={() => router.push(`/admin/orders/${o.orderId}`)}
                  >
                    <td className="px-5 py-3 font-semibold text-gold-dark">{o.orderId}</td>
                    <td className="px-5 py-3">
                      <div className="text-ink font-medium">{o.fullName}</div>
                      <div className="text-text-muted text-[0.78rem]">{o.phone}</div>
                    </td>
                    <td className="px-5 py-3 text-ink">{o.productName}</td>
                    <td className="px-5 py-3 text-text-muted">{formatDate(o.preferredDate)}</td>
                    <td className="px-5 py-3 text-ink">{o.total != null ? `₹${o.total}` : "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge label={ORDER_STATUS_LABEL[o.status]} tone={statusTone(o.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-outline btn-sm disabled:opacity-40">
            Previous
          </button>
          <span className="px-3 py-2 text-[0.85rem] text-text-muted">
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn btn-outline btn-sm disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      <div className="mt-4">
        <Link href="/admin" className="text-text-muted text-[0.85rem] hover:text-gold-dark">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function statusTone(status: string): BadgeTone {
  switch (status) {
    case "confirmed":
    case "preparing":
    case "ready":
      return "gold";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersList />
    </Suspense>
  );
}
