"use client";

import { useEffect, useState, useCallback } from "react";
import type { CategoryRecord } from "@/lib/catalogStore";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { Layers } from "lucide-react";

interface FormState {
  name: string;
  description: string;
  image: string;
}

const blank: FormState = { name: "", description: "", image: "" };

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleImageFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((prev) => ({ ...prev, image: e.target?.result as string }));
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
  }

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
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

  function openEdit(c: CategoryRecord) {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description, image: c.image || "" });
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast("Category name is required.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save category.");
      showToast(editingId ? "Category updated." : "Category created.");
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
    await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    showToast("Category deleted.");
    setDeleteTarget(null);
    load();
  }

  async function toggleActive(c: CategoryRecord) {
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active })
    });
    load();
  }

  async function move(c: CategoryRecord, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((s) => s.id === c.id);
    const swapWith = sorted[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      fetch(`/api/admin/categories/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayOrder: swapWith.displayOrder }) }),
      fetch(`/api/admin/categories/${swapWith.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayOrder: c.displayOrder }) })
    ]);
    load();
  }

  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group your menu into sections like Basic Cakes, Bento Cakes, or Cupcakes."
        actions={
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            + Add Category
          </button>
        }
      />

      {loading ? (
        <TableSkeleton rows={4} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Categories Yet"
          description="Add a category to start organizing your menu."
          action={
            <button onClick={openCreate} className="btn btn-primary btn-sm">
              Add Your First Category
            </button>
          }
        />
      ) : (
        <div className="card divide-y divide-border">
          {sorted.map((c, i) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(c, -1)} disabled={i === 0} className="text-text-muted disabled:opacity-30 text-xs leading-none">
                  &#9650;
                </button>
                <button onClick={() => move(c, 1)} disabled={i === sorted.length - 1} className="text-text-muted disabled:opacity-30 text-xs leading-none">
                  &#9660;
                </button>
              </div>
              {c.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt="" className="w-10 h-10 rounded-[8px] object-cover border border-border" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink">{c.name}</div>
                {c.description && <div className="text-text-muted text-[0.82rem] truncate">{c.description}</div>}
              </div>
              <button
                onClick={() => toggleActive(c)}
                className={`text-[0.75rem] px-2.5 py-1 rounded-full font-medium ${c.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                style={c.active ? { background: "var(--gold-dark)" } : undefined}
              >
                {c.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => openEdit(c)} className="btn btn-outline btn-sm">
                Edit
              </button>
              <button onClick={() => setDeleteTarget(c)} className="btn btn-sm text-white" style={{ background: "var(--danger)" }}>
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
            <h2 className="text-[1.3rem]">{editingId ? "Edit Category" : "Add Category"}</h2>
            <button onClick={() => setPanelOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-xl" style={{ background: "var(--blush-soft)" }}>
              &times;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div>
              <label className="field-label">Name</label>
              <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea className="field-input min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Category Image</label>
              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image} alt="" className="w-24 h-24 object-cover rounded-[10px] border border-border mb-2.5" />
              )}
              <div className="flex gap-2 mb-2">
                <label className="flex-1 border-2 border-dashed border-border rounded-[14px] p-4 text-center cursor-pointer hover:border-gold hover:bg-blush-soft transition-colors">
                  <span className="text-[0.85rem] text-text-muted">{imageUploading ? "Uploading…" : "Click or drag an image here"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files?.[0])} />
                </label>
                <button type="button" onClick={() => setPickerOpen(true)} className="btn btn-outline btn-sm whitespace-nowrap">
                  Choose From Library
                </button>
              </div>
              <input
                className="field-input"
                placeholder="…or paste an image URL / external reference"
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>
          </div>

          <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(dataUrl) => setForm((prev) => ({ ...prev, image: dataUrl }))} />
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
        title="Delete this category?"
        message={`"${deleteTarget?.name}" will be removed. Products in this category will become uncategorized, not deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
