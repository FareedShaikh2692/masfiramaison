"use client";

import { useEffect, useState } from "react";

interface MediaAsset {
  id: string;
  name: string;
  dataUrl: string;
}

export default function MediaPickerModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (dataUrl: string) => void }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    function load() {
      setLoading(true);
      fetch("/api/admin/media")
        .then((r) => r.json())
        .then((data) => setAssets(data.assets || []))
        .finally(() => setLoading(false));
    }
    Promise.resolve().then(load);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center p-6" style={{ background: "rgba(64,51,42,0.6)" }} onClick={onClose}>
      <div className="card p-6 max-w-[560px] w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[1.1rem]">Choose From Library</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: "var(--blush-soft)" }}>
            &times;
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-[10px] bg-blush-soft animate-pulse" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <p className="text-text-muted text-[0.88rem] text-center py-8">No images in the library yet — upload one from the Media page first.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {assets.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  onSelect(a.dataUrl);
                  onClose();
                }}
                className="aspect-square rounded-[10px] overflow-hidden border border-border hover:border-gold transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.dataUrl} alt={a.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
