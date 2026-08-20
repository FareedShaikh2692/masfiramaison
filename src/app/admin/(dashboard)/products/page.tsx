"use client";

import { useEffect, useState, useCallback } from "react";
import type { CategoryRecord, FlavorRecord, ProductRecord } from "@/lib/catalogStore";
import ProductForm, { ProductFormValue, blankProductForm, productToForm } from "@/components/admin/ProductForm";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import SortableTh from "@/components/admin/SortableTh";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { Cake } from "lucide-react";

type SortKey = "name" | "price";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [flavors, setFlavors] = useState<FlavorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }


  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormValue>(blankProductForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes, fRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/categories"),
      fetch("/api/admin/flavors")
    ]);
    const [pData, cData, fData] = await Promise.all([pRes.json(), cRes.json(), fRes.json()]);
    setProducts(pData.products || []);
    setCategories(cData.categories || []);
    setFlavors(fData.flavors || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(blankProductForm());
    setPanelOpen(true);
  }

  function openEdit(p: ProductRecord) {
    setEditingId(p.id);
    setForm(productToForm(p));
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast("Product name is required.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      categoryId: form.categoryId || null,
      description: form.description,
      image: form.image,
      additionalImages: form.additionalImages,
      flavors: form.flavors,
      fields: form.fields,
      price: form.price === "" ? null : Number(form.price),
      pricePerUnit: form.pricePerUnit,
      weightOptions: form.weightOptions.length ? form.weightOptions : null,
      packOptions: form.packOptions.length ? form.packOptions : null,
      badge: form.badge || null,
      prepTime: form.prepTime || null,
      featured: form.featured,
      active: form.active
    };
    try {
      const res = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save product.");
      showToast(editingId ? "Product updated." : "Product created.");
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
    await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    showToast("Product deleted.");
    setDeleteTarget(null);
    load();
  }

  async function handleDuplicate(p: ProductRecord) {
    await fetch(`/api/admin/products/${p.id}/duplicate`, { method: "POST" });
    showToast(`Duplicated "${p.name}".`);
    load();
  }

  async function toggleActive(p: ProductRecord) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, categoryId: p.categoryId, active: !p.active })
    });
    load();
  }

  const filtered = products
    .filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      if (statusFilter === "active" && !p.active) return false;
      if (statusFilter === "inactive" && p.active) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "price") return ((a.price ?? 0) - (b.price ?? 0)) * sortDir;
      return a.name.localeCompare(b.name) * sortDir;
    });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your cakes, flavors, sizes and pricing."
        actions={
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            + Add Product
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="field-input max-w-[260px]"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="field-input max-w-[200px]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="field-input max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Cake}
          title={products.length === 0 ? "No Products Yet" : "No Matches"}
          description={products.length === 0 ? "Add your first cake to start building the menu." : "No products match your filters."}
          action={
            products.length === 0 && (
              <button onClick={openCreate} className="btn btn-primary btn-sm">
                Add Your First Product
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="w-12 h-12 rounded-[8px] object-cover border border-border flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink truncate">{p.name}</div>
                    <div className="text-text-muted text-[0.8rem]">{categories.find((c) => c.id === p.categoryId)?.name || "—"}</div>
                  </div>
                  <span className="text-ink font-semibold flex-shrink-0">{p.price == null ? "On request" : `₹${p.price}`}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`text-[0.75rem] px-2.5 py-1 rounded-full font-medium ${p.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                    style={p.active ? { background: "var(--gold-dark)" } : undefined}
                  >
                    {p.active ? "Active" : "Inactive"}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="btn btn-outline btn-sm">
                      Edit
                    </button>
                    <button onClick={() => setDeleteTarget(p)} className="btn btn-sm text-white" style={{ background: "var(--danger)" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block card overflow-x-auto">
            <table className="w-full text-[0.88rem]">
              <thead>
                <tr className="border-b border-border text-left text-text-muted text-[0.75rem] uppercase tracking-wide">
                  <SortableTh label="Product" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                  <th className="px-5 py-3 font-medium">Category</th>
                  <SortableTh label="Price" active={sortKey === "price"} dir={sortDir} onClick={() => toggleSort("price")} />
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt="" className="w-10 h-10 rounded-[8px] object-cover border border-border flex-shrink-0" />
                        )}
                        <span className="font-medium text-ink">{p.name}</span>
                        {p.featured && <span className="text-[0.65rem] uppercase px-2 py-0.5 rounded-full bg-blush-soft text-gold-dark">Featured</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{categories.find((c) => c.id === p.categoryId)?.name || "—"}</td>
                    <td className="px-5 py-3 text-ink">{p.price == null ? "On request" : `₹${p.price}`}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`text-[0.75rem] px-2.5 py-1 rounded-full font-medium ${p.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                        style={p.active ? { background: "var(--gold-dark)" } : undefined}
                      >
                        {p.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="btn btn-outline btn-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDuplicate(p)} className="btn btn-outline btn-sm">
                          Duplicate
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="btn btn-sm text-white" style={{ background: "var(--danger)" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Slide-over form */}
      <div
        className={`fixed inset-0 z-[1200] flex justify-end transition-opacity duration-300 ${panelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(64,51,42,0.55)" }}
      >
        <div className="absolute inset-0" onClick={() => setPanelOpen(false)} />
        <div
          className={`relative w-full sm:w-[560px] h-full bg-cream shadow-2xl flex flex-col transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="px-6 py-5 border-b border-border flex items-center justify-between" style={{ background: "var(--ivory)" }}>
            <h2 className="text-[1.3rem]">{editingId ? "Edit Product" : "Add Product"}</h2>
            <button onClick={() => setPanelOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-xl" style={{ background: "var(--blush-soft)" }}>
              &times;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <ProductForm value={form} onChange={setForm} categories={categories} flavors={flavors} />
          </div>
          <div className="px-6 py-4 border-t border-border flex gap-3" style={{ background: "var(--ivory)" }}>
            <button onClick={() => setPanelOpen(false)} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this product?"
        message={`"${deleteTarget?.name}" will be permanently removed and will no longer appear on the site.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
