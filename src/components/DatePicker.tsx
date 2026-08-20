"use client";

import { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseISO(iso: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
}

function formatDisplay(iso: string): string {
  const parsed = parseISO(iso);
  if (!parsed) return "";
  return `${parsed.day} ${MONTH_NAMES[parsed.month]} ${parsed.year}`;
}

/** Monday = 0 .. Sunday = 6 */
function mondayIndex(year: number, month: number, day: number): number {
  return (new Date(year, month, day).getDay() + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function DatePicker({
  value,
  onChange,
  minDate,
  isDateDisabled,
  error,
  placeholder = "Select a date"
}: {
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
  isDateDisabled?: (iso: string) => boolean;
  error?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const initial = parseISO(value) || parseISO(minDate || "") || { year: new Date().getFullYear(), month: new Date().getMonth(), day: 1 };
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  useEffect(() => {
    const parsed = parseISO(value);
    if (!parsed) return;
    Promise.resolve().then(() => {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    });
  }, [value]);

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

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function isDisabled(iso: string): boolean {
    if (minDate && iso < minDate) return true;
    if (isDateDisabled && isDateDisabled(iso)) return true;
    return false;
  }

  const total = daysInMonth(viewYear, viewMonth);
  const leadingBlanks = mondayIndex(viewYear, viewMonth, 1);
  const cells: (number | null)[] = [...Array(leadingBlanks).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`field-input flex items-center justify-between gap-2 text-left ${error ? "field-error" : ""}`}
      >
        <span className={value ? "text-ink" : "text-text-muted"}>{value ? formatDisplay(value) : placeholder}</span>
        <span aria-hidden className="text-gold-dark">📅</span>
      </button>

      {open && (
        <div
          className="absolute left-0 mt-1.5 rounded-[14px] border border-border shadow-[0_20px_50px_rgba(64,51,42,0.16)] p-4 z-50 w-[300px]"
          style={{ background: "var(--ivory)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-blush-soft">
              ‹
            </button>
            <span className="font-serif text-[1rem] text-ink">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-blush-soft">
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="text-center text-[0.72rem] font-semibold text-text-muted py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day == null) return <div key={i} />;
              const iso = toISO(viewYear, viewMonth, day);
              const disabled = isDisabled(iso);
              const selected = iso === value;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`aspect-square rounded-full text-[0.85rem] flex items-center justify-center transition-colors ${
                    disabled
                      ? "text-border cursor-not-allowed"
                      : selected
                        ? "text-white font-semibold"
                        : "text-ink hover:bg-blush-soft"
                  }`}
                  style={selected ? { background: "var(--gold-dark)" } : undefined}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {value && (
            <button type="button" onClick={() => onChange("")} className="text-[0.8rem] text-danger mt-3">
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
