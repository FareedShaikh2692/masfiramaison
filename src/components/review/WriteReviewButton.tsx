"use client";

import { useState } from "react";
import WriteReviewModal from "@/components/review/WriteReviewModal";

export default function WriteReviewButton({ className = "btn btn-primary" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        Write a Review
      </button>
      <WriteReviewModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
