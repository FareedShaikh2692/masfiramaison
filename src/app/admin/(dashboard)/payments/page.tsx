"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { OrderRecord, PaymentStatus } from "@/lib/types";
import { PAYMENT_STATUS_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";
import SortableTh from "@/components/admin/SortableTh";

const PAYMENT_STATUS_OPTIONS = ["all", ...Object.keys(PAYMENT_STATUS_LABEL)];

type SortKey = "preferredDate" | "total" | "advancePaid";

function paymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case "paid":
      return "#5A7D5A";
    case "partially_paid":
      return "var(--gold-dark)";
    case "failed":
    case "refunded":
      return "var(--danger)";
    default:
      return "#9A8C7A";
  }
}

function PaymentsList() {
  const router = useRouter();
  const params = useSearchParams();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("preferredDate");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const paymentStatus = params.get("paymentStatus") || "all";
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
    const qs = new URLSearchParams({ paymentStatus, page: String(page), pageSize: String(pageSize) });
    if (search) qs.set("search", search);
    const res = await fetch(`/api/admin/orders?${qs}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [paymentStatus, page, search]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  function setPaymentStatus(next: string) {
    setPage(1);
    router.push(next === "all" ? "/admin/payments" : `/admin/payments?paymentStatus=${next}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const sortedOrders = orders.slice().sort((a, b) => {
    if (sortKey === "total") return ((a.total ?? 0) - (b.total ?? 0)) * sortDir;
    if (sortKey === "advancePaid") return ((a.advancePaid ?? 0) - (b.advancePaid ?? 0)) * sortDir;
    return a.preferredDate.localeCompare(b.preferredDate) * sortDir;
  });

  return (
    <div>
      <h1 className="text-[1.6rem] mb-6">Payments</h1>

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
        <select className="field-input max-w-[220px]" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          {PAYMENT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Payment Statuses" : PAYMENT_STATUS_LABEL[s as PaymentStatus]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-14 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-text-muted">No orders match your search.</div>
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {sortedOrders.map((o) => {
              const balance = o.total != null ? Math.max(o.total - (o.advancePaid || 0), 0) : null;
              const status = o.paymentStatus || "pending";
              return (
                <div key={o.orderId} className="card p-4 cursor-pointer" onClick={() => router.push(`/admin/orders/${o.orderId}`)}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-semibold text-gold-dark">{o.orderId}</span>
                    <span className="text-[0.72rem] px-2.5 py-1 rounded-full font-medium text-white" style={{ background: paymentStatusColor(status) }}>
                      {PAYMENT_STATUS_LABEL[status]}
                    </span>
                  </div>
                  <div className="text-ink font-medium">{o.fullName}</div>
                  <div className="text-text-muted text-[0.8rem] mb-2">{o.phone} · {formatDate(o.preferredDate)}</div>
                  <div className="flex items-center justify-between text-[0.85rem]">
                    <span className="text-text-muted">Paid {o.advancePaid != null ? `₹${o.advancePaid}` : "—"} · Due {balance != null ? `₹${balance}` : "—"}</span>
                    <span className="text-ink font-semibold">{o.total != null ? `₹${o.total}` : "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:block card overflow-x-auto">
            <table className="w-full text-[0.86rem]">
              <thead>
                <tr className="border-b border-border text-left text-text-muted text-[0.72rem] uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <SortableTh label="Date" active={sortKey === "preferredDate"} dir={sortDir} onClick={() => toggleSort("preferredDate")} />
                  <SortableTh label="Total" active={sortKey === "total"} dir={sortDir} onClick={() => toggleSort("total")} />
                  <SortableTh label="Advance Paid" active={sortKey === "advancePaid"} dir={sortDir} onClick={() => toggleSort("advancePaid")} />
                  <th className="px-5 py-3 font-medium">Balance Due</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((o) => {
                  const balance = o.total != null ? Math.max(o.total - (o.advancePaid || 0), 0) : null;
                  const status = o.paymentStatus || "pending";
                  return (
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
                      <td className="px-5 py-3 text-text-muted">{formatDate(o.preferredDate)}</td>
                      <td className="px-5 py-3 text-ink">{o.total != null ? `₹${o.total}` : "—"}</td>
                      <td className="px-5 py-3 text-ink">{o.advancePaid != null ? `₹${o.advancePaid}` : "—"}</td>
                      <td className="px-5 py-3 text-ink">{balance != null ? `₹${balance}` : "—"}</td>
                      <td className="px-5 py-3 text-text-muted capitalize">{o.paymentMethod || "—"}</td>
                      <td className="px-5 py-3">
                        <span className="text-[0.72rem] px-2.5 py-1 rounded-full font-medium text-white" style={{ background: paymentStatusColor(status) }}>
                          {PAYMENT_STATUS_LABEL[status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsList />
    </Suspense>
  );
}
