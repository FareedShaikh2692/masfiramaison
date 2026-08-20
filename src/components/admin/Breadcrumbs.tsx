"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Dashboard",
  orders: "Orders",
  payments: "Payments",
  products: "Products",
  categories: "Categories",
  flavors: "Flavors",
  sizes: "Cake Sizes",
  "price-list": "Price List",
  customers: "Customers",
  reviews: "Reviews",
  coupons: "Coupons & Offers",
  delivery: "Delivery",
  media: "Media Library",
  content: "Website Content",
  settings: "Settings",
  analytics: "Analytics",
  profile: "My Profile"
};

function label(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  return decodeURIComponent(segment);
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return <span className="admin-page-title text-[1.1rem]">Dashboard</span>;
  }

  const crumbs = segments.map((seg, i) => ({
    label: label(seg),
    href: "/" + segments.slice(0, i + 1).join("/")
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.86rem] min-w-0">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight size={13} className="text-text-muted flex-shrink-0" />}
            {isLast ? (
              <span className="text-ink font-semibold truncate">{c.label}</span>
            ) : (
              <Link href={c.href} className="text-text-muted hover:text-gold-dark truncate">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
