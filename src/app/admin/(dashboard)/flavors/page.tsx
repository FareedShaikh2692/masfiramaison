"use client";

import { useEffect, useState, useCallback } from "react";
import type { FlavorRecord } from "@/lib/catalogStore";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";

export default function AdminFlavorsPage() {
  const { showToast } = useToast();
  const [flavors, setFlavors] = useState<FlavorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FlavorRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/flavors");
    const data = await res.json();
    setFlavors(data.flavors || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/flavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, displayOrder: flavors.length })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add flavor.");
      setNewName("");
      showToast("Flavor added.");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setAdding(false);
    }
  }

  async function saveRename(id: string) {
    if (!editingName.trim()) return;
    await fetch(`/api/admin/flavors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName })
    });
    setEditingId(null);
    load();
  }

  async function toggleActive(f: FlavorRecord) {
    await fetch(`/api/admin/flavors/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !f.active })
    });
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/flavors/${deleteTarget.id}`, { method: "DELETE" });
    showToast("Flavor deleted.");
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <h1 className="text-[1.6rem] mb-6">Flavors</h1>

      <form onSubmit={handleAdd} className="flex gap-3 mb-6 max-w-[420px]">
        <input className="field-input" placeholder="New flavor name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button type="submit" disabled={adding} className="btn btn-primary btn-sm whitespace-nowrap">
          + Add
        </button>
      </form>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-12 animate-pulse" />
          ))}
        </div>
      ) : flavors.length === 0 ? (
        <div className="card p-10 text-center text-text-muted">No flavors yet — add your first one above.</div>
      ) : (
        <div className="card divide-y divide-border max-w-[560px]">
          {flavors.map((f) => (
            <div key={f.id} className="flex items-center gap-3 px-5 py-3">
              {editingId === f.id ? (
                <input
                  className="field-input flex-1"
                  value={editingName}
                  autoFocus
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => saveRename(f.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveRename(f.id)}
                />
              ) : (
                <span className="flex-1 text-ink font-medium">{f.name}</span>
              )}
              <button
                onClick={() => toggleActive(f)}
                className={`text-[0.75rem] px-2.5 py-1 rounded-full font-medium ${f.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                style={f.active ? { background: "var(--gold-dark)" } : undefined}
              >
                {f.active ? "Active" : "Inactive"}
              </button>
              <button
                onClick={() => {
                  setEditingId(f.id);
                  setEditingName(f.name);
                }}
                className="btn btn-outline btn-sm"
              >
                Rename
              </button>
              <button onClick={() => setDeleteTarget(f)} className="btn btn-sm text-white" style={{ background: "var(--danger)" }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this flavor?"
        message={`"${deleteTarget?.name}" will be removed from the flavor list. Products already using it keep the name as plain text.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
