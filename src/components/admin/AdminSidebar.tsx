"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/flavors", label: "Flavors" },
  { href: "/admin/settings", label: "Settings" }
];

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--ivory)" }}>
      <Link href="/admin" className="flex items-center gap-3 px-6 py-6 border-b border-border" onClick={onNavigate}>
        <Image src="/images/monogram.svg" alt="" width={34} height={34} />
        <div>
          <div className="font-serif text-[1.05rem] leading-tight text-ink">Masfira Maison</div>
          <div className="text-[0.68rem] uppercase tracking-wide text-text-muted">Admin</div>
        </div>
      </Link>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`block px-4 py-2.5 rounded-[10px] text-[0.92rem] font-medium transition-colors ${
                active ? "text-white" : "text-ink hover:bg-blush-soft"
              }`}
              style={active ? { background: "linear-gradient(135deg, var(--gold), var(--gold-dark))" } : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-border">
        <Link href="/" className="text-[0.8rem] text-text-muted hover:text-gold-dark">
          &larr; View Live Site
        </Link>
      </div>
    </div>
  );
}
