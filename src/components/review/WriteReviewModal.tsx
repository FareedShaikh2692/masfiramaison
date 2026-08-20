"use client";

import { useState } from "react";
import ReviewForm from "@/components/review/ReviewForm";

export default function WriteReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    onClose();
    setTimeout(() => setSubmitted(false), 300);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4" style={{ background: "rgba(64,51,42,0.55)" }} onClick={handleClose}>
      <div className="card w-full max-w-[560px] max-h-[90vh] overflow-y-auto p-7 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[1.4rem]">{submitted ? "Thank You!" : "Share Your Experience"}</h3>
          <button onClick={handleClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: "var(--blush-soft)" }}>
            &times;
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <p className="text-[2.5rem] mb-3">💕</p>
            <p className="text-ink font-medium mb-2">Thank you for sharing your experience with Masfira Maison!</p>
            <p className="text-text-muted text-[0.9rem] mb-6">Your review will appear on our site once it&apos;s reviewed.</p>
            <button onClick={handleClose} className="btn btn-primary">
              Close
            </button>
          </div>
        ) : (
          <ReviewForm onSubmitted={() => setSubmitted(true)} />
        )}
      </div>
    </div>
  );
}
