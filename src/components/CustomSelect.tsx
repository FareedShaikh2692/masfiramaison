"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

export default function CustomSelect({ value, onChange, options, groups, placeholder = "Select…", error, disabled }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const flatOptions = groups ? groups.flatMap((g) => g.options) : options || [];
  const selected = flatOptions.find((o) => o.value === value);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function select(v: string) {
    onChange(v);
    setOpen(false);
  }

  function renderOption(o: SelectOption) {
    const active = o.value === value;
    return (
      <button
        key={o.value}
        type="button"
        onClick={() => select(o.value)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-[0.92rem] transition-colors ${
          active ? "text-gold-dark font-semibold" : "text-ink hover:bg-blush-soft"
        }`}
        style={active ? { background: "var(--blush-soft)" } : undefined}
      >
        {o.label}
        {active && <span aria-hidden>✓</span>}
      </button>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`field-input flex items-center justify-between gap-2 text-left disabled:opacity-50 disabled:cursor-not-allowed ${error ? "field-error" : ""}`}
      >
        <span className={selected ? "text-ink" : "text-text-muted"}>{selected ? selected.label : placeholder}</span>
        <span aria-hidden className={`text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-1.5 rounded-[10px] border border-border shadow-[0_16px_40px_rgba(64,51,42,0.14)] max-h-[280px] overflow-y-auto z-50"
          style={{ background: "var(--ivory)" }}
        >
          {groups
            ? groups.map((g) => (
                <div key={g.label}>
                  <div className="px-4 pt-2.5 pb-1 text-[0.72rem] uppercase tracking-wide font-semibold text-gold-dark sticky top-0" style={{ background: "var(--ivory)" }}>
                    {g.label}
                  </div>
                  {g.options.map(renderOption)}
                </div>
              ))
            : flatOptions.map(renderOption)}
        </div>
      )}
    </div>
  );
}
