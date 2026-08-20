"use client";

import { useEffect, useState, useCallback } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import PageHeader from "@/components/admin/PageHeader";
import { TableSkeleton } from "@/components/admin/Skeleton";

interface SizeRecord {
  id: string;
  label: string;
  active: boolean;
}

export default function AdminSizesPage() {
  const { showToast } = useToast();
  const [sizes, setSizes] = useState<SizeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SizeRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/sizes");
    const data = await res.json();
    setSizes(data.sizes || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) {
      showToast("Type a size label first.", "error");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel, displayOrder: sizes.length })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add size.");
      setNewLabel("");
      showToast("Size added.");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(s: SizeRecord) {
    await fetch(`/api/admin/sizes/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active })
    });
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/sizes/${deleteTarget.id}`, { method: "DELETE" });
    showToast("Size deleted.");
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Cake Sizes"
        description="A shared list of size labels (e.g. Bento, 500g, 1 kg) you can pick from while setting up a product's weight pricing — pricing itself stays per-product."
      />

      <form onSubmit={handleAdd} className="flex gap-3 mb-6 max-w-[420px]">
        <input className="field-input" placeholder="New size label, e.g. 2.5 kg" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
        <button type="submit" disabled={adding} className="btn btn-primary btn-sm whitespace-nowrap">
          + Add
        </button>
      </form>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : sizes.length === 0 ? (
        <div className="card p-10 text-center text-text-muted">No sizes yet — add your first one above.</div>
      ) : (
        <div className="card divide-y divide-border max-w-[480px]">
          {sizes.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3">
              <span className="flex-1 text-ink font-medium">{s.label}</span>
              <button
                onClick={() => toggleActive(s)}
                className={`text-[0.75rem] px-2.5 py-1 rounded-full font-medium ${s.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                style={s.active ? { background: "var(--gold-dark)" } : undefined}
              >
                {s.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => setDeleteTarget(s)} className="btn btn-sm text-white" style={{ background: "var(--danger)" }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete this size?" message={`"${deleteTarget?.label}" will be removed from the picker.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
