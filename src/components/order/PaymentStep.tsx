"use client";

import { useRef, useState } from "react";
import { PAYMENT_METHODS } from "@/data/data";
import { formatCurrency } from "@/lib/format";
import type { PaymentMethodConfig } from "@/lib/types";

export default function PaymentStep({
  orderId,
  total,
  onConfirmed
}: {
  orderId: string;
  total: number | null;
  onConfirmed: (method: PaymentMethodConfig["id"]) => void;
}) {
  const [method, setMethod] = useState<PaymentMethodConfig["id"]>("upi");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = PAYMENT_METHODS.find((m) => m.id === method)!;

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setScreenshot(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!screenshot) {
      setError("Please upload a screenshot of your payment before continuing.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method, paymentScreenshot: screenshot })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit payment confirmation.");
      onConfirmed(method);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-7">
      <div className="text-center">
        <span className="inline-block px-4 py-1.5 rounded-full text-[0.75rem] font-semibold uppercase tracking-wide" style={{ background: "var(--blush-soft)", color: "var(--gold-dark)" }}>
          Order {orderId} · Payment Pending
        </span>
        <h3 className="text-[1.4rem] mt-3.5 mb-2">Complete Your Advance Payment</h3>
        <p className="text-text-muted text-[0.94rem]">
          To confirm your order, please complete the advance payment using one of the available payment methods below.
        </p>
      </div>

      <div className="card p-6 text-center">
        <span className="text-[0.85rem] text-text-muted">Estimated Total</span>
        <div className="font-serif text-[2rem] font-bold text-gold-dark">{formatCurrency(total)}</div>
      </div>

      <div>
        <label className="field-label">Choose Payment Method</label>
        <div className="grid grid-cols-3 gap-3">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`py-3.5 rounded-[10px] border text-[0.86rem] font-semibold transition-colors ${
                method === m.id ? "text-white" : "text-ink border-border bg-ivory"
              }`}
              style={method === m.id ? { background: "var(--gold-dark)", borderColor: "var(--gold-dark)" } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[14px] p-5 border border-border bg-ivory">
        {selected.identifier ? (
          <p className="text-[0.92rem] text-ink m-0">
            Pay via <strong>{selected.label}</strong> to: <strong>{selected.identifier}</strong>
          </p>
        ) : (
          <p className="text-[0.9rem] text-text-muted m-0">
            Our team will share the {selected.label} QR code / payment ID with you directly on WhatsApp after reviewing your order.
          </p>
        )}
      </div>

      <div>
        <label className="field-label">Upload Payment Screenshot</label>
        <label
          htmlFor="paymentScreenshotInput"
          className="block border-2 border-dashed border-border rounded-[18px] p-6 text-center cursor-pointer hover:border-gold hover:bg-blush-soft transition-colors"
        >
          <p className="text-[0.88rem] text-text-muted m-0">Click or drag your payment screenshot here</p>
          <input ref={fileRef} id="paymentScreenshotInput" type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
        {screenshot && (
          <div className="relative inline-block mt-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshot} alt="Payment screenshot preview" className="w-[120px] h-[120px] object-cover rounded-[10px] border border-border" />
            <button
              type="button"
              onClick={() => {
                setScreenshot(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 w-[26px] h-[26px] rounded-full bg-danger text-white border-2 border-ivory text-[0.85rem]"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-danger text-[0.85rem]">{error}</p>}

      <button onClick={submit} disabled={submitting} className="btn btn-primary btn-block">
        {submitting ? "Submitting…" : "Submit Payment Confirmation"}
      </button>
      <p className="field-hint text-center">
        Your order is confirmed only after we verify your advance payment. Cash on Delivery is not available.
      </p>
    </div>
  );
}
