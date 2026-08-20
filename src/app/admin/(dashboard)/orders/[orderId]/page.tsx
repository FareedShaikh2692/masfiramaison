"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { OrderRecord, OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/admin/Toast";

const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "payment_pending",
  "payment_verification",
  "confirmed",
  "preparing",
  "ready",
  "completed"
];

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [advanceInput, setAdvanceInput] = useState("");
  const [itemPriceInput, setItemPriceInput] = useState("");
  const [designChargeInput, setDesignChargeInput] = useState("");
  const [deliveryChargeInput, setDeliveryChargeInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}`);
    if (!res.ok) {
      setOrder(null);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrder(data.order);
    setAdvanceInput(data.order.advancePaid != null ? String(data.order.advancePaid) : "");
    setItemPriceInput(data.order.itemPrice != null ? String(data.order.itemPrice) : "");
    setDesignChargeInput(data.order.customDesignCharge != null ? String(data.order.customDesignCharge) : "");
    setDeliveryChargeInput(data.order.deliveryCharge != null ? String(data.order.deliveryCharge) : "");
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  async function updateStatus(status: OrderStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update order.");
      setOrder(data.order);
      showToast(`Status updated to "${ORDER_STATUS_LABEL[status]}".`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function savePricing() {
    const itemPrice = itemPriceInput === "" ? null : Number(itemPriceInput);
    const customDesignCharge = designChargeInput === "" ? null : Number(designChargeInput);
    const deliveryCharge = deliveryChargeInput === "" ? null : Number(deliveryChargeInput);
    const total = itemPrice == null && customDesignCharge == null && deliveryCharge == null
      ? null
      : (itemPrice || 0) + (customDesignCharge || 0) + (deliveryCharge || 0);

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemPrice, customDesignCharge, deliveryCharge, total })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update pricing.");
      setOrder(data.order);
      showToast("Pricing updated.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function saveAdvance() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advancePaid: advanceInput === "" ? null : Number(advanceInput) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update.");
      setOrder(data.order);
      showToast("Payment amount updated.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="card h-64 animate-pulse" />;
  if (!order) {
    return (
      <div className="card p-12 text-center">
        <p className="text-text-muted mb-4">Order not found.</p>
        <Link href="/admin/orders" className="btn btn-outline btn-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  const balanceDue = order.total != null ? Math.max(order.total - (order.advancePaid || 0), 0) : null;

  return (
    <div className="max-w-[820px]">
      <div className="flex items-center gap-3 mb-1">
        <Link href="/admin/orders" className="text-text-muted text-[0.85rem] hover:text-gold-dark">
          &larr; Orders
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-[1.6rem]">{order.orderId}</h1>
        <a href={`/invoice/${order.orderId}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">
          View Invoice
        </a>
      </div>

      {/* Status flow */}
      <div className="card p-5 mb-6">
        <p className="field-label mb-3">Order Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={updating}
              className={`px-3.5 py-1.5 rounded-full text-[0.8rem] font-medium border transition-colors ${
                order.status === s ? "text-white" : "text-ink border-border bg-ivory"
              }`}
              style={order.status === s ? { background: "var(--gold-dark)", borderColor: "var(--gold-dark)" } : undefined}
            >
              {ORDER_STATUS_LABEL[s]}
            </button>
          ))}
          <button
            onClick={() => updateStatus("cancelled")}
            disabled={updating}
            className="px-3.5 py-1.5 rounded-full text-[0.8rem] font-medium border"
            style={order.status === "cancelled" ? { background: "var(--danger)", borderColor: "var(--danger)", color: "white" } : { borderColor: "var(--danger)", color: "var(--danger)" }}
          >
            Cancel Order
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <p className="field-label mb-3">Customer</p>
          <dl className="space-y-2 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-text-muted">Name</dt>
              <dd className="text-ink font-medium">{order.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Phone</dt>
              <dd className="text-ink font-medium">{order.phone}</dd>
            </div>
            {order.email && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Email</dt>
                <dd className="text-ink font-medium">{order.email}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="card p-5">
          <p className="field-label mb-3">Delivery</p>
          <dl className="space-y-2 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-text-muted">Method</dt>
              <dd className="text-ink font-medium capitalize">{order.fulfillment}</dd>
            </div>
            {order.address && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted flex-shrink-0">Address</dt>
                <dd className="text-ink font-medium text-right">{order.address}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-text-muted">Date</dt>
              <dd className="text-ink font-medium">{formatDate(order.preferredDate)}</dd>
            </div>
            {order.preferredTime && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Time</dt>
                <dd className="text-ink font-medium">{order.preferredTime}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="card p-5 md:col-span-2">
          <p className="field-label mb-3">Cake Details</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.9rem]">
            <Row label="Product" value={order.productName} />
            <Row label="Flavor" value={order.flavor} />
            <Row label="Combo — Bento Flavor" value={order.comboFlavor} />
            <Row label="Combo — Cupcake Flavor" value={order.comboCupcakeFlavor} />
            <Row label="Weight" value={order.weight} />
            <Row label="Pack Size" value={order.packSize} />
            <Row label="Quantity" value={order.quantity ? String(order.quantity) : undefined} />
            <Row label="Design" value={order.design} />
            <Row label="Theme" value={order.theme} />
            <Row label="Cake Color" value={order.cakeColor} />
            <Row label="Message on Cake" value={order.cakeMessage} />
            <Row label="Occasion" value={order.occasion} />
            <Row label="Add-ons" value={order.addOns?.join(", ")} />
          </dl>
          {order.specialInstructions && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-text-muted text-[0.8rem] mb-1">Special Instructions</p>
              <p className="text-ink text-[0.9rem]">{order.specialInstructions}</p>
            </div>
          )}
          {order.referenceImage && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-text-muted text-[0.8rem] mb-2">Reference Image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.referenceImage} alt="Customer reference" className="w-32 h-32 object-cover rounded-[10px] border border-border" />
            </div>
          )}
        </div>

        <div className="card p-5 md:col-span-2">
          <p className="field-label mb-3">Pricing Breakdown</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="field-label">Base / Item Price (₹)</label>
              <input className="field-input" type="number" min={0} value={itemPriceInput} onChange={(e) => setItemPriceInput(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Custom Design Charge (₹)</label>
              <input className="field-input" type="number" min={0} value={designChargeInput} onChange={(e) => setDesignChargeInput(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Delivery Charge (₹)</label>
              <input className="field-input" type="number" min={0} value={deliveryChargeInput} onChange={(e) => setDeliveryChargeInput(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={savePricing} disabled={updating} className="btn btn-outline btn-sm">
              Save Pricing
            </button>
            <span className="text-[0.9rem] text-ink">
              Total: <strong className="text-gold-dark">{order.total != null ? `₹${order.total}` : "To be confirmed"}</strong>
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.9rem] mb-4 pt-4 border-t border-border">
            <Row label="Payment Method" value={order.paymentMethod} />
            <Row label="Balance Due" value={balanceDue != null ? `₹${balanceDue}` : undefined} />
          </dl>
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-[220px]">
              <label className="field-label">Advance Paid (₹)</label>
              <input className="field-input" type="number" value={advanceInput} onChange={(e) => setAdvanceInput(e.target.value)} />
            </div>
            <button onClick={saveAdvance} disabled={updating} className="btn btn-outline btn-sm">
              Update
            </button>
          </div>
          {order.paymentScreenshot && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-text-muted text-[0.8rem] mb-2">Payment Screenshot</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.paymentScreenshot} alt="Payment proof" className="w-40 rounded-[10px] border border-border" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <>
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-ink font-medium text-right">{value}</dd>
    </>
  );
}
