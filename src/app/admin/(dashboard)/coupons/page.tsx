"use client";

import { useEffect, useState, useCallback } from "react";
import { BUSINESS } from "@/data/data";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";

interface CouponRecord {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
}

interface FormState {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderAmount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  active: boolean;
}

const blank: FormState = { code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", startDate: "", endDate: "", usageLimit: "", active: true };

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CouponRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(blank);
    setPanelOpen(true);
  }

  function openEdit(c: CouponRecord) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      startDate: c.startDate || "",
      endDate: c.endDate || "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      active: c.active
    });
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.discountValue) {
      showToast("Coupon code and discount value are required.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      code: form.code,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount === "" ? null : Number(form.minOrderAmount),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      active: form.active
    };
    try {
      const res = await fetch(editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save coupon.");
      showToast(editingId ? "Coupon updated." : "Coupon created.");
      setPanelOpen(false);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/coupons/${deleteTarget.id}`, { method: "DELETE" });
    showToast("Coupon deleted.");
    setDeleteTarget(null);
    load();
  }

  async function toggleActive(c: CouponRecord) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active })
    });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-[1.6rem]">Coupons &amp; Offers</h1>
        <button onClick={openCreate} className="btn btn-primary btn-sm">
          + Add Coupon
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-text-muted mb-4">No coupons yet.</p>
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[0.88rem]">
            <thead>
              <tr className="border-b border-border text-left text-text-muted text-[0.72rem] uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Min. Order</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-serif font-semibold text-gold-dark">{c.code}</td>
                  <td className="px-5 py-3 text-ink">{c.discountType === "percentage" ? `${c.discountValue}%` : `${BUSINESS.currencySymbol}${c.discountValue}`}</td>
                  <td className="px-5 py-3 text-text-muted">{c.minOrderAmount != null ? `${BUSINESS.currencySymbol}${c.minOrderAmount}` : "—"}</td>
                  <td className="px-5 py-3 text-text-muted">{c.usageCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ""}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`text-[0.75rem] px-2.5 py-1 rounded-full font-medium ${c.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                      style={c.active ? { background: "var(--gold-dark)" } : undefined}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="btn btn-outline btn-sm">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="btn btn-sm text-white" style={{ background: "var(--danger)" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        className={`fixed inset-0 z-[1200] flex justify-end transition-opacity duration-300 ${panelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(64,51,42,0.55)" }}
      >
        <div className="absolute inset-0" onClick={() => setPanelOpen(false)} />
        <div className={`relative w-full sm:w-[460px] h-full bg-cream shadow-2xl flex flex-col transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="px-6 py-5 border-b border-border flex items-center justify-between" style={{ background: "var(--ivory)" }}>
            <h2 className="text-[1.3rem]">{editingId ? "Edit Coupon" : "Add Coupon"}</h2>
            <button onClick={() => setPanelOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-xl" style={{ background: "var(--blush-soft)" }}>
              &times;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div>
              <label className="field-label">Coupon Code</label>
              <input className="field-input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="MASFIRA10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Discount Type</label>
                <select className="field-input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="field-label">{form.discountType === "percentage" ? "Discount %" : "Discount ₹"}</label>
                <input className="field-input" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="field-label">Minimum Order Amount (₹, optional)</label>
              <input className="field-input" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Start Date (optional)</label>
                <input className="field-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="field-label">End Date (optional)</label>
                <input className="field-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="field-label">Usage Limit (optional)</label>
              <input className="field-input" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited if blank" />
            </div>
            <label className="flex items-center gap-2 text-[0.88rem] text-ink cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[var(--gold-dark)]" />
              Active
            </label>
          </div>
          <div className="px-6 py-4 border-t border-border flex gap-3" style={{ background: "var(--ivory)" }}>
            <button onClick={() => setPanelOpen(false)} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this coupon?"
        message={`"${deleteTarget?.code}" will no longer be usable at checkout.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
