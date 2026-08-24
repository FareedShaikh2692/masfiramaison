"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { Images } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface GalleryImage {
  id: string;
  image: string;
  categoryId: string | null;
  categoryName: string | null;
  alt: string;
  displayOrder: number;
  active: boolean;
}

export default function AdminGalleryPage() {
  const { showToast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [gRes, cRes] = await Promise.all([fetch("/api/admin/gallery"), fetch("/api/admin/categories")]);
    const [gData, cData] = await Promise.all([gRes.json(), cRes.json()]);
    setImages(gData.images || []);
    setCategories((cData.categories || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  async function uploadFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      try {
        await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl, categoryId: pendingCategoryId || null, alt: file.name.replace(/\.[^.]+$/, "") })
        });
      } catch {
        showToast(`Could not upload ${file.name}.`, "error");
      }
    }
    setUploading(false);
    showToast("Upload complete.");
    load();
  }

  async function updateImage(img: GalleryImage, patch: Partial<GalleryImage>) {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, ...patch } : i)));
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/gallery/${deleteTarget.id}`, { method: "DELETE" });
    showToast("Image removed from gallery.");
    setDeleteTarget(null);
    load();
  }

  const filtered = categoryFilter === "all" ? images : images.filter((i) => i.categoryId === categoryFilter);
  const grouped = categories
    .map((c) => ({ category: c, items: filtered.filter((i) => i.categoryId === c.id) }))
    .filter((g) => g.items.length > 0);
  const uncategorized = filtered.filter((i) => !i.categoryId);

  return (
    <div>
      <PageHeader title="Gallery" description="Add photos to the public gallery, organized by product type." />

      <div className="card p-5 mb-8">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-3">
          <div>
            <label className="field-label">Category for new uploads</label>
            <select className="field-input" value={pendingCategoryId} onChange={(e) => setPendingCategoryId(e.target.value)}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            uploadFiles(e.dataTransfer.files);
          }}
          className={`block border-2 border-dashed rounded-[16px] p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-gold bg-blush-soft" : "border-border bg-ivory"}`}
        >
          <p className="text-[0.92rem] text-ink font-medium mb-1">{uploading ? "Uploading…" : "Drag and drop images here, or click to browse"}</p>
          <p className="text-text-muted text-[0.8rem] m-0">Choose a category above first, then upload — you can change it per-image below too.</p>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-4 py-2 rounded-full text-[0.85rem] font-medium border ${categoryFilter === "all" ? "text-white border-transparent" : "text-ink border-border"}`}
          style={categoryFilter === "all" ? { background: "var(--gold-dark)" } : undefined}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-4 py-2 rounded-full text-[0.85rem] font-medium border ${categoryFilter === c.id ? "text-white border-transparent" : "text-ink border-border"}`}
            style={categoryFilter === c.id ? { background: "var(--gold-dark)" } : undefined}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Images} title="No Images Yet" description="Upload photos above to start building the public gallery." />
      ) : (
        <div className="space-y-8">
          {grouped.map((g) => (
            <div key={g.category.id}>
              <h2 className="admin-section-title mb-3">{g.category.name}</h2>
              <ImageGrid items={g.items} categories={categories} onUpdate={updateImage} onDelete={setDeleteTarget} />
            </div>
          ))}
          {uncategorized.length > 0 && (
            <div>
              <h2 className="admin-section-title mb-3">Uncategorized</h2>
              <ImageGrid items={uncategorized} categories={categories} onUpdate={updateImage} onDelete={setDeleteTarget} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this image?"
        message="It will be removed from the public gallery."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ImageGrid({
  items,
  categories,
  onUpdate,
  onDelete
}: {
  items: GalleryImage[];
  categories: CategoryOption[];
  onUpdate: (img: GalleryImage, patch: Partial<GalleryImage>) => void;
  onDelete: (img: GalleryImage) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((img) => (
        <div key={img.id} className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.image} alt={img.alt} className="w-full aspect-square object-cover" />
          <div className="p-3 space-y-2">
            <input
              className="field-input text-[0.8rem] py-1.5"
              placeholder="Alt text"
              value={img.alt}
              onChange={(e) => onUpdate(img, { alt: e.target.value })}
            />
            <select
              className="field-input text-[0.8rem] py-1.5"
              value={img.categoryId || ""}
              onChange={(e) => onUpdate(img, { categoryId: e.target.value || null })}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex items-center justify-between">
              <button
                onClick={() => onUpdate(img, { active: !img.active })}
                className={`text-[0.7rem] px-2 py-1 rounded-full font-medium ${img.active ? "text-white" : "text-text-muted bg-blush-soft"}`}
                style={img.active ? { background: "var(--gold-dark)" } : undefined}
              >
                {img.active ? "Visible" : "Hidden"}
              </button>
              <button onClick={() => onDelete(img)} className="text-danger text-[0.75rem] font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
