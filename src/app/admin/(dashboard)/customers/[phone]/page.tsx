"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { OrderRecord } from "@/lib/types";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { BUSINESS } from "@/data/data";
import { useToast } from "@/components/admin/Toast";

export default function AdminCustomerDetailPage() {
  const { phone } = useParams<{ phone: string }>();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      Promise.all([
        fetch(`/api/admin/customers/${phone}`).then((r) => r.json()),
        fetch("/api/admin/customers").then((r) => r.json())
      ])
        .then(([orderData, listData]) => {
          setOrders(orderData.orders || []);
          const match = (listData.customers || []).find((c: { phone: string }) => c.phone === decodeURIComponent(phone));
          setNotes(match?.notes || "");
        })
        .finally(() => setLoading(false));
    });
  }, [phone]);

  async function saveNotes() {
    setSaving(true);
    await fetch(`/api/admin/customers/${phone}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
    showToast("Notes saved.");
    setSaving(false);
  }

  if (loading) return <div className="card h-64 animate-pulse" />;
  if (!orders.length) {
    return (
      <div className="card p-12 text-center">
        <p className="text-text-muted mb-4">No orders found for this customer.</p>
        <Link href="/admin/customers" className="btn btn-outline btn-sm">
          Back to Customers
        </Link>
      </div>
    );
  }

  const latest = orders[0];
  const totalSpent = orders.reduce((s, o) => s + (o.advancePaid || 0), 0);
  const addresses = [...new Set(orders.map((o) => o.address).filter(Boolean))];

  return (
    <div className="max-w-[820px]">
      <Link href="/admin/customers" className="text-text-muted text-[0.85rem] hover:text-gold-dark">
        &larr; Customers
      </Link>
      <h1 className="text-[1.6rem] mt-1 mb-6">{latest.fullName}</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-[0.78rem] text-text-muted mb-1">Total Orders</div>
          <div className="font-serif text-[1.4rem] font-bold text-ink">{orders.length}</div>
        </div>
        <div className="card p-5">
          <div className="text-[0.78rem] text-text-muted mb-1">Total Spent</div>
          <div className="font-serif text-[1.4rem] font-bold text-gold-dark">{BUSINESS.currencySymbol}{totalSpent.toLocaleString("en-IN")}</div>
        </div>
        <div className="card p-5">
          <div className="text-[0.78rem] text-text-muted mb-1">Contact</div>
          <div className="text-ink font-medium">{latest.phone}</div>
          {latest.email && <div className="text-text-muted text-[0.82rem]">{latest.email}</div>}
        </div>
      </div>

      {addresses.length > 0 && (
        <div className="card p-5 mb-6">
          <p className="field-label mb-2">Addresses Used</p>
          {addresses.map((a, i) => (
            <p key={i} className="text-[0.88rem] text-ink m-0">{a}</p>
          ))}
        </div>
      )}

      <div className="card p-5 mb-6">
        <p className="field-label mb-2">Internal Notes</p>
        <textarea className="field-input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferences, allergies, VIP status, anything worth remembering…" />
        <button onClick={saveNotes} disabled={saving} className="btn btn-outline btn-sm mt-3">
          {saving ? "Saving…" : "Save Notes"}
        </button>
      </div>

      <p className="field-label mb-3">Order History</p>
      <div className="card divide-y divide-border">
        {orders.map((o) => (
          <Link key={o.orderId} href={`/admin/orders/${o.orderId}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-blush-soft/40">
            <div>
              <span className="font-semibold text-gold-dark">{o.orderId}</span>
              <span className="text-ink ml-3">{o.productName}</span>
            </div>
            <div className="flex items-center gap-4 text-[0.85rem]">
              <span className="text-text-muted">{formatDate(o.preferredDate)}</span>
              <span className="text-ink">{o.total != null ? `₹${o.total}` : "—"}</span>
              <span className="text-text-muted">{ORDER_STATUS_LABEL[o.status]}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
