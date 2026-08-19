"use client";

import { useRef, useState } from "react";
import { PAYMENT_METHODS, BUSINESS } from "@/data/data";
import { formatCurrency } from "@/lib/format";
import type { PaymentMethodConfig, OrderStatus } from "@/lib/types";
import RazorpayButton from "@/components/order/RazorpayButton";

const RAZORPAY_ENABLED = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
const ONLINE_METHODS: PaymentMethodConfig["id"][] = ["googlepay", "upi", "paytm"];

export default function PaymentStep({
  orderId,
  total,
  cashEligible,
  customerName,
  customerPhone,
  customerEmail,
  onConfirmed
}: {
  orderId: string;
  total: number | null;
  cashEligible: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  onConfirmed: (method: PaymentMethodConfig["id"], status: OrderStatus) => void;
}) {
  const availableMethods = PAYMENT_METHODS.filter((m) => !m.pickupOnly || cashEligible);
  const [method, setMethod] = useState<PaymentMethodConfig["id"]>("upi");
  const [amount, setAmount] = useState<number | "">(total ?? "");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = availableMethods.find((m) => m.id === method) || availableMethods[0];
  const isCash = selected.id === "cash";
  const useRazorpay = RAZORPAY_ENABLED && ONLINE_METHODS.includes(selected.id);

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setScreenshot(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function submitManual() {
    if (!isCash && !screenshot) {
      setError("Please upload a screenshot of your payment before continuing.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: selected.id,
          paymentScreenshot: isCash ? null : screenshot,
          advancePaid: isCash ? null : amount === "" ? total : amount
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit payment confirmation.");
      onConfirmed(selected.id, data.status as OrderStatus);
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
          {availableMethods.map((m) => (
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
        {!cashEligible && (
          <p className="field-hint">Cash is only available for pickup orders — delivery requires advance online payment.</p>
        )}
      </div>

      {isCash && (
        <div className="rounded-[14px] p-5 border border-border bg-ivory">
          <p className="text-[0.92rem] text-ink m-0">
            You&rsquo;ll pay in cash when you collect your order at pickup. No online payment is needed right now — just confirm below and we&rsquo;ll get started.
          </p>
        </div>
      )}

      {useRazorpay && !isCash && (
        <div className="space-y-4">
          <div>
            <label className="field-label">Amount You&rsquo;re Paying Now</label>
            <input
              className="field-input"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <span className="field-hint">Paying a partial advance is fine — the remaining balance is due at pickup/delivery.</span>
          </div>
          <RazorpayButton
            orderId={orderId}
            amount={amount === "" ? total ?? 0 : amount}
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            onSuccess={() => onConfirmed(selected.id, "confirmed")}
          />
          <p className="field-hint text-center">
            Secure checkout powered by Razorpay — your order is confirmed automatically the moment payment is verified.
          </p>
        </div>
      )}

      {!isCash && !useRazorpay && (
        <>
          <div className="rounded-[14px] p-5 border border-border bg-ivory">
            {selected.identifier ? (
              <p className="text-[0.92rem] text-ink m-0">
                Pay via <strong>{selected.label}</strong> to: <strong>{selected.identifier}</strong>
              </p>
            ) : (
              <p className="text-[0.9rem] text-text-muted m-0">
                Our team will share the {selected.label} QR code / payment ID with you directly on WhatsApp after reviewing your order.
                {RAZORPAY_ENABLED ? "" : ` (${BUSINESS.name} hasn't enabled instant online checkout yet.)`}
              </p>
            )}
          </div>

          <div>
            <label className="field-label">Amount You&rsquo;re Paying Now</label>
            <input
              className="field-input"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <span className="field-hint">Paying a partial advance is fine — the remaining balance is due at pickup/delivery.</span>
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
        </>
      )}

      {error && <p className="text-danger text-[0.85rem]">{error}</p>}

      {!useRazorpay && (
        <>
          <button onClick={submitManual} disabled={submitting} className="btn btn-primary btn-block">
            {submitting ? "Submitting…" : isCash ? "Confirm Order — Pay Cash at Pickup" : "Submit Payment Confirmation"}
          </button>
          <p className="field-hint text-center">
            {isCash
              ? "Your order request is confirmed once our team reviews it — cash is collected at pickup."
              : "Your order is confirmed only after we verify your advance payment. Cash on Delivery is not available."}
          </p>
        </>
      )}
    </div>
  );
}
