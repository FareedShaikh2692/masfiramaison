"use client";

import { useState } from "react";
import ReviewForm from "@/components/review/ReviewForm";

export default function ReviewTokenForm({
  reviewToken,
  orderId,
  customerName,
  customerPhone,
  productName
}: {
  reviewToken: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center py-6">
        <p className="text-[2.5rem] mb-3">💕</p>
        <p className="text-ink font-medium mb-2">Thank you for sharing your experience with Masfira Maison!</p>
        <p className="text-text-muted text-[0.9rem] m-0">Your review will appear on our site once it&apos;s reviewed.</p>
      </div>
    );
  }

  return (
    <ReviewForm
      prefill={{ reviewToken, orderId, customerName, customerPhone, productName, locked: true }}
      onSubmitted={() => setSubmitted(true)}
    />
  );
}
