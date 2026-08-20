"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-outline btn-sm">
      Print / Save as PDF
    </button>
  );
}
