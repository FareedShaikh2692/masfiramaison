"use client";

import Link from "next/link";
import { waLink } from "@/lib/format";
import { useOrder } from "@/components/order/OrderContext";

export default function MobileBottomNav() {
  const { openProductOrder } = useOrder();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[800] grid grid-cols-4 bg-[rgba(251,246,238,0.97)] backdrop-blur-md shadow-[0_-6px_24px_rgba(64,51,42,0.12)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile"
    >
      <Link href="/#home" className="flex flex-col items-center justify-center gap-1 py-2.5 text-[0.68rem] font-semibold text-ink">
        <span aria-hidden>🏠</span>
        Home
      </Link>
      <Link href="/#menu" className="flex flex-col items-center justify-center gap-1 py-2.5 text-[0.68rem] font-semibold text-ink">
        <span aria-hidden>🍰</span>
        Menu
      </Link>
      <a
        href={waLink()}
        target="_blank"
        rel="noopener"
        className="flex flex-col items-center justify-center gap-1 py-2.5 text-[0.68rem] font-semibold text-[#1fb959]"
      >
        <span aria-hidden>💬</span>
        WhatsApp
      </a>
      <button
        onClick={() => openProductOrder()}
        className="flex flex-col items-center justify-center gap-1 py-2.5 text-[0.68rem] font-bold text-white"
        style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))" }}
      >
        <span aria-hidden>🛒</span>
        Order Now
      </button>
    </nav>
  );
}
