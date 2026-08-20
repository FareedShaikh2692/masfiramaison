"use client";

import { useEffect, useState, useCallback } from "react";
import { BUSINESS } from "@/data/data";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";

interface ZoneRecord {
  id: string;
  name: string;
  chargeType: "fixed" | "range" | "quote";
  fixedCharge: number | null;
  minCharge: number | null;
  maxCharge: number | null;
  active: boolean;
  displayOrder: number;
}

interface FormState {
  name: string;
  chargeType: "fixed" | "range" | "quote";
  fixedCharge: string;
  minCharge: string;
  maxCharge: string;
  active: boolean;
}

const blank: FormState = { name: "", chargeType: "fixed", fixedCharge: "", minCharge: "", maxCharge: "", active: true };

export default function AdminDeliveryPage() {
  const { showToast } = useToast();
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ZoneRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/delivery-zones");
    const data = await res.json();
    setZones(data.zones || []);
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

  function openEdit(z: ZoneRecord) {
    setEditingId(z.id);
    setForm({
      name: z.name,
      chargeType: z.chargeType,
      fixedCharge: z.fixedCharge != null ? String(z.fixedCharge) : "",
      minCharge: z.minCharge != null ? String(z.minCharge) : "",
      maxCharge: z.maxCharge != null ? String(z.maxCharge) : "",
      active: z.active
    });
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast("Zone name is required.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      chargeType: form.chargeType,
      fixedCharge: form.chargeType === "fixed" && form.fixedCharge !== "" ? Number(form.fixedCharge) : null,
      minCharge: form.chargeType === "range" && form.minCharge !== "" ? Number(form.minCharge) : null,
      maxCharge: form.chargeType === "range" && form.maxCharge !== "" ? Number(form.maxCharge) : null,
      active: form.active
    };
    try {
      const res = await fetch(editingId ? `/api/admin/delivery-zones/${editingId}` : "/api/admin/delivery-zones", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save zone.");
      showToast(editingId ? "Zone updated." : "Zone created.");
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
    await fetch(`/api/admin/delivery-zones/${deleteTarget.id}`, { method: "DELETE" });
    showToast("Zone deleted.");
    setDeleteTarget(null);
    load();
  }

  async function toggleActive(z: ZoneRecord) {
    await fetch(`/api/admin/delivery-zones/${z.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !z.active })
    });
    load();
  }

  function chargeLabel(z: ZoneRecord) {
    if (z.chargeType === "fixed") return z.fixedCharge != null ? `${BUSINESS.currencySymbol}${z.fixedCharge}` : "—";
    if (z.chargeType === "range") return z.minCharge != null && z.maxCharge != null ? `${BUSINESS.currencySymbol}${z.minCharge}–${z.maxCharge}` : "—";
    return "As per delivery service";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-[1.6rem]">Delivery Zones</h1>
        <button onClick={openCreate} className="btn btn-primary btn-sm">
          + Add Zone
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-14 animate-pulse" />
          ))}
        </div>
      ) : zones.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-text-muted mb-4">No delivery zones yet.</p>
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            Add Your First Zone
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {zones.map((z) => (
            <div key={z.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1">
                <div className="font-medium text-ink">{z.name}</div>
                <div className="text-text-muted text-[0.82rem]">{chargeLabel(z)}</div>
              </div>
              <button
                onClick={() => toggleActive(z)}
                className={`text-[0.75rem] px-2.5 py-1 rounded-full font-medium ${z.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                style={z.active ? { background: "var(--gold-dark)" } : undefined}
              >
                {z.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => openEdit(z)} className="btn btn-outline btn-sm">
                Edit
              </button>
              <button onClick={() => setDeleteTarget(z)} className="btn btn-sm text-white" style={{ background: "var(--danger)" }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`fixed inset-0 z-[1200] flex justify-end transition-opacity duration-300 ${panelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(64,51,42,0.55)" }}
      >
        <div className="absolute inset-0" onClick={() => setPanelOpen(false)} />
        <div className={`relative w-full sm:w-[460px] h-full bg-cream shadow-2xl flex flex-col transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="px-6 py-5 border-b border-border flex items-center justify-between" style={{ background: "var(--ivory)" }}>
            <h2 className="text-[1.3rem]">{editingId ? "Edit Zone" : "Add Zone"}</h2>
            <button onClick={() => setPanelOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-xl" style={{ background: "var(--blush-soft)" }}>
              &times;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div>
              <label className="field-label">Zone / Area Name</label>
              <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kondhwa" />
            </div>
            <div>
              <label className="field-label">Charge Type</label>
              <select className="field-input" value={form.chargeType} onChange={(e) => setForm({ ...form, chargeType: e.target.value as FormState["chargeType"] })}>
                <option value="fixed">Fixed Charge</option>
                <option value="range">Min–Max Range</option>
                <option value="quote">As Per Delivery Service (no fixed charge)</option>
              </select>
            </div>
            {form.chargeType === "fixed" && (
              <div>
                <label className="field-label">Charge (₹)</label>
                <input className="field-input" type="number" value={form.fixedCharge} onChange={(e) => setForm({ ...form, fixedCharge: e.target.value })} />
              </div>
            )}
            {form.chargeType === "range" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Min (₹)</label>
                  <input className="field-input" type="number" value={form.minCharge} onChange={(e) => setForm({ ...form, minCharge: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Max (₹)</label>
                  <input className="field-input" type="number" value={form.maxCharge} onChange={(e) => setForm({ ...form, maxCharge: e.target.value })} />
                </div>
              </div>
            )}
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

      <ConfirmDialog open={!!deleteTarget} title="Delete this zone?" message={`"${deleteTarget?.name}" will be removed from delivery options.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
