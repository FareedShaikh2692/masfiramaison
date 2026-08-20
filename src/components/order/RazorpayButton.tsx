"use client";

import { useState } from "react";
import { useBusiness } from "@/components/BusinessContext";

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadCheckoutScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the payment widget. Check your connection and try again."));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export default function RazorpayButton({
  orderId,
  amount,
  customerName,
  customerPhone,
  customerEmail,
  onSuccess
}: {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  onSuccess: () => void;
}) {
  const business = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      await loadCheckoutScript();

      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Could not start payment.");

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: business.name,
        description: `Order ${orderId}`,
        order_id: orderData.razorpayOrderId,
        prefill: { name: customerName, contact: customerPhone, email: customerEmail || undefined },
        theme: { color: "#a9803d" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, amount, ...response })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed.");
            onSuccess();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) }
      });

      rzp.on("payment.failed", (response: unknown) => {
        const description = (response as { error?: { description?: string } })?.error?.description;
        setError(description || "Payment failed. Please try again or use another method.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={pay} disabled={loading} className="btn btn-primary btn-block">
        {loading ? "Opening secure checkout…" : `Pay ₹${amount} Now`}
      </button>
      {error && <p className="text-danger text-[0.85rem] mt-2.5">{error}</p>}
    </div>
  );
}
