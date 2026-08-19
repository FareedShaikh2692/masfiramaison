"use client";

import { waLink } from "@/lib/format";

export default function ConfirmationStep({
  orderId,
  heading,
  message,
  statusLabel,
  waMessage,
  invoiceHref,
  onBackHome
}: {
  orderId: string;
  heading: string;
  message: string;
  statusLabel: string;
  waMessage: string;
  invoiceHref?: string;
  onBackHome: () => void;
}) {
  return (
    <div className="text-center py-4">
      <div className="w-[84px] h-[84px] mx-auto mb-5 rounded-full flex items-center justify-center text-gold-dark" style={{ background: "var(--blush-soft)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-10 h-10">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h2 className="text-[1.5rem] mb-3">{heading}</h2>
      <p className="text-text-muted mb-1.5">{message}</p>
      <div className="inline-block my-4 px-5 py-2.5 rounded-full font-serif font-bold text-gold-dark" style={{ background: "var(--blush-soft)" }}>
        Order ID: {orderId}
      </div>
      <p className="text-[0.82rem] uppercase tracking-wide font-semibold text-text-muted mb-6">Status: {statusLabel}</p>
      <div className="flex flex-col gap-3">
        <a href={waLink(waMessage)} target="_blank" rel="noopener" className="btn btn-whatsapp btn-block">
          Contact Us on WhatsApp
        </a>
        {invoiceHref && (
          <a href={invoiceHref} target="_blank" rel="noopener" className="btn btn-outline btn-block">
            View Invoice
          </a>
        )}
        <button onClick={onBackHome} className="btn btn-outline btn-block">
          Back to Home
        </button>
      </div>
    </div>
  );
}
