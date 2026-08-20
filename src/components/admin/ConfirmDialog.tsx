"use client";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  danger = true,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6" style={{ background: "rgba(64,51,42,0.55)" }} onClick={onCancel}>
      <div className="card p-7 max-w-[380px] w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[1.15rem] mb-2">{title}</h3>
        <p className="text-text-muted text-[0.9rem] mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-outline btn-sm flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-sm flex-1 text-white"
            style={{ background: danger ? "var(--danger)" : "var(--gold-dark)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
