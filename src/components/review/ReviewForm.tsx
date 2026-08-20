"use client";

import { useRef, useState } from "react";

const OCCASIONS = ["Birthday", "Anniversary", "Wedding", "Engagement", "Baby Shower", "Celebration", "Other"];
const MAX_PHOTOS = 5;

export interface ReviewPrefill {
  reviewToken?: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  productName?: string;
  locked?: boolean;
}

export default function ReviewForm({ prefill, onSubmitted }: { prefill?: ReviewPrefill; onSubmitted: () => void }) {
  const [customerName, setCustomerName] = useState(prefill?.customerName || "");
  const [customerPhone] = useState(prefill?.customerPhone || "");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [occasion, setOccasion] = useState("");
  const [productName, setProductName] = useState(prefill?.productName || "");
  const [orderId, setOrderId] = useState(prefill?.orderId || "");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS - images.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => setImages((prev) => [...prev, e.target?.result as string]);
        reader.readAsDataURL(file);
      });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!customerName.trim()) return setError("Please enter your name.");
    if (!rating) return setError("Please choose a star rating.");
    if (!reviewText.trim()) return setError("Please share a few words about your experience.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone: customerPhone || undefined,
          rating,
          reviewText,
          occasion: occasion || undefined,
          productName: productName || undefined,
          orderId: orderId || undefined,
          reviewToken: prefill?.reviewToken,
          images
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label className="field-label">Your Name</label>
        <input className="field-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={prefill?.locked} />
      </div>

      <div>
        <label className="field-label">Rating</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="text-[1.9rem] leading-none transition-transform hover:scale-110"
              style={{ color: (hoverRating || rating) >= n ? "var(--gold-dark)" : "var(--border)" }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">Tell us about your experience</label>
        <textarea
          className="field-input min-h-[110px]"
          placeholder="How was the taste, design, packaging, delivery..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Cake / Product</label>
          <input className="field-input" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Optional" disabled={prefill?.locked && !!prefill.productName} />
        </div>
        <div>
          <label className="field-label">Occasion</label>
          <select className="field-input" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
            <option value="">Optional</option>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {!prefill?.orderId && (
        <div>
          <label className="field-label">Order ID</label>
          <input className="field-input" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Optional, e.g. MM-1234" />
        </div>
      )}

      <div>
        <label className="field-label">Photos of Your Cake (optional, up to {MAX_PHOTOS})</label>
        <label
          htmlFor="reviewImageInput"
          className="block border-2 border-dashed border-border rounded-[18px] p-6 text-center cursor-pointer hover:border-gold hover:bg-blush-soft transition-colors"
        >
          <p className="text-[0.88rem] text-text-muted m-0">Click or drag photos here</p>
          <input
            ref={fileRef}
            id="reviewImageInput"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={images.length >= MAX_PHOTOS}
          />
        </label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3.5">
            {images.map((img, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-[84px] h-[84px] object-cover rounded-[10px] border border-border" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove image"
                  className="absolute -top-2 -right-2 w-[22px] h-[22px] rounded-full bg-danger text-white border-2 border-ivory text-[0.75rem]"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-danger text-[0.85rem]">{error}</p>}

      <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
