"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Cake } from "lucide-react";
import type { SearchResult } from "@/app/api/admin/search/route";

const ICONS = { order: ShoppingBag, customer: User, product: Cake } as const;

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      Promise.resolve().then(() => setResults([]));
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => setResults(data.results || []))
        .catch(() => setResults([]));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div className="relative hidden md:block flex-1 max-w-[380px]" ref={rootRef}>
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      <input
        className="field-input pl-9"
        placeholder="Search orders, customers, cakes…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-2 rounded-[12px] border border-border shadow-[0_20px_50px_rgba(64,51,42,0.15)] bg-white z-50 max-h-[360px] overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-text-muted text-[0.85rem] text-center py-6 px-4">No matches for &ldquo;{query}&rdquo;.</p>
          ) : (
            results.map((r, i) => {
              const Icon = ICONS[r.type];
              return (
                <button
                  key={`${r.type}-${i}`}
                  onClick={() => go(r.href)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blush-soft/60 border-b border-border last:border-0"
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--blush-soft)" }}>
                    <Icon size={13} color="var(--gold-dark)" />
                  </span>
                  <span className="min-w-0">
                    <div className="text-[0.85rem] font-medium text-ink truncate">{r.label}</div>
                    <div className="text-[0.75rem] text-text-muted truncate">{r.sublabel}</div>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
