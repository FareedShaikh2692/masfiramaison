"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";

interface MediaAsset {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const { showToast } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/media${q ? `?search=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setAssets(data.assets || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
        await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, dataUrl })
        });
      } catch {
        showToast(`Could not upload ${file.name}.`, "error");
      }
    }
    setUploading(false);
    showToast("Upload complete.");
    load(search);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/media/${deleteTarget.id}`, { method: "DELETE" });
    showToast("Image deleted.");
    setDeleteTarget(null);
    load(search);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-[1.6rem]">Media Library</h1>
        <input className="field-input max-w-[240px]" placeholder="Search images…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
        className={`block border-2 border-dashed rounded-[16px] p-8 text-center cursor-pointer transition-colors mb-8 ${dragOver ? "border-gold bg-blush-soft" : "border-border bg-ivory"}`}
      >
        <p className="text-[0.92rem] text-ink font-medium mb-1">{uploading ? "Uploading…" : "Drag and drop images here, or click to browse"}</p>
        <p className="text-text-muted text-[0.8rem] m-0">PNG or JPG, up to ~3MB each</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
      </label>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card aspect-square animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="card p-12 text-center text-text-muted">No images yet — upload some above.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {assets.map((a) => (
            <div key={a.id} className="card overflow-hidden group relative">
              <div className="block w-full aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.dataUrl} alt={a.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-[0.72rem] text-text-muted truncate m-0">{a.name}</p>
              </div>
              <button
                onClick={() => setDeleteTarget(a)}
                aria-label="Delete"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-danger text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete this image?" message={`"${deleteTarget?.name}" will be removed from the library. Products already using it keep their own copy.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
