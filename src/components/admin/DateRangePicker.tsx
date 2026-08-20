"use client";

import { useState } from "react";

const RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" }
];

export interface DateRangeValue {
  range: string;
  from?: string;
  to?: string;
}

export default function DateRangePicker({ value, onChange }: { value: DateRangeValue; onChange: (v: DateRangeValue) => void }) {
  const [showCustom, setShowCustom] = useState(value.range === "custom");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => {
            setShowCustom(r.value === "custom");
            onChange({ range: r.value, from: value.from, to: value.to });
          }}
          className={`px-3.5 py-1.5 rounded-full text-[0.82rem] font-medium border transition-colors ${
            value.range === r.value ? "text-white" : "text-ink border-border bg-ivory"
          }`}
          style={value.range === r.value ? { background: "var(--gold-dark)", borderColor: "var(--gold-dark)" } : undefined}
        >
          {r.label}
        </button>
      ))}
      {showCustom && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="date"
            className="field-input py-1.5 text-[0.82rem]"
            value={value.from || ""}
            onChange={(e) => onChange({ ...value, range: "custom", from: e.target.value })}
          />
          <span className="text-text-muted text-[0.82rem]">to</span>
          <input
            type="date"
            className="field-input py-1.5 text-[0.82rem]"
            value={value.to || ""}
            onChange={(e) => onChange({ ...value, range: "custom", to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
