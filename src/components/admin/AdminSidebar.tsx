"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Cake,
  Users,
  Star,
  ListOrdered,
  Tag,
  Truck,
  CreditCard,
  FileText,
  Settings,
  ArrowLeft,
  ChevronDown,
  type LucideIcon
} from "lucide-react";

interface SingleItem {
  type: "single";
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface GroupItem {
  type: "group";
  label: string;
  icon: LucideIcon;
  base: string;
  items: { href: string; label: string }[];
}

const NAV: (SingleItem | GroupItem)[] = [
  { type: "single", href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { type: "single", href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  {
    type: "group",
    label: "Orders",
    icon: ShoppingBag,
    base: "/admin/orders",
    items: [
      { href: "/admin/orders", label: "All Orders" },
      { href: "/admin/orders?status=pending", label: "Pending" },
      { href: "/admin/orders?status=confirmed", label: "Confirmed" },
      { href: "/admin/orders?status=preparing", label: "Preparing" },
      { href: "/admin/orders?status=completed", label: "Completed" },
      { href: "/admin/orders?status=cancelled", label: "Cancelled" }
    ]
  },
  {
    type: "group",
    label: "Products",
    icon: Cake,
    base: "/admin/products",
    items: [
      { href: "/admin/products", label: "All Products" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/flavors", label: "Flavors" },
      { href: "/admin/sizes", label: "Cake Sizes" },
      { href: "/admin/media", label: "Media Library" }
    ]
  },
  { type: "single", href: "/admin/customers", label: "Customers", icon: Users },
  {
    type: "group",
    label: "Reviews",
    icon: Star,
    base: "/admin/reviews",
    items: [
      { href: "/admin/reviews", label: "All Reviews" },
      { href: "/admin/reviews?status=pending", label: "Pending" },
      { href: "/admin/reviews?status=published", label: "Published" }
    ]
  },
  { type: "single", href: "/admin/price-list", label: "Price List", icon: ListOrdered },
  { type: "single", href: "/admin/coupons", label: "Coupons & Offers", icon: Tag },
  { type: "single", href: "/admin/delivery", label: "Delivery", icon: Truck },
  { type: "single", href: "/admin/payments", label: "Payments", icon: CreditCard },
  { type: "single", href: "/admin/content", label: "Website Content", icon: FileText },
  { type: "single", href: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminSidebar({
  onNavigate,
  collapsed = false
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const active = NAV.find((n) => n.type === "group" && pathname.startsWith(n.base)) as GroupItem | undefined;
    Promise.resolve().then(() => setOpenGroup(active ? active.label : null));
  }, [pathname]);

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--ivory)" }}>
      <Link href="/admin" className={`flex items-center gap-3 py-6 border-b border-border ${collapsed ? "justify-center px-3" : "px-6"}`} onClick={onNavigate}>
        <Image src="/images/monogram.svg" alt="" width={32} height={32} className="flex-shrink-0" />
        {!collapsed && (
          <div>
            <div className="font-serif text-[1.02rem] leading-tight text-ink">Masfira Maison</div>
            <div className="admin-label">Admin</div>
          </div>
        )}
      </Link>

      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          if (item.type === "single") {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={`admin-sidebar-link ${active ? "active" : ""} ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={17} strokeWidth={2} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }

          const Icon = item.icon;
          const groupActive = pathname.startsWith(item.base);
          const isOpen = !collapsed && openGroup === item.label;

          if (collapsed) {
            return (
              <div key={item.label} className="relative group">
                <Link href={item.items[0].href} title={item.label} className={`admin-sidebar-link justify-center ${groupActive ? "active" : ""}`}>
                  <Icon size={17} strokeWidth={2} className="flex-shrink-0" />
                </Link>
              </div>
            );
          }

          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                className={`admin-sidebar-link w-full justify-between ${groupActive && !isOpen ? "active" : ""}`}
              >
                <span className="flex items-center gap-[0.65rem]">
                  <Icon size={17} strokeWidth={2} className="flex-shrink-0" />
                  <span>{item.label}</span>
                </span>
                <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="ml-[1.85rem] mt-0.5 mb-1 space-y-0.5 border-l border-border pl-3">
                  {item.items.map((sub) => {
                    const subActive = sub.href.includes("?") ? currentUrl === sub.href : pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onNavigate}
                        className={`block px-3 py-1.5 rounded-[8px] text-[0.83rem] transition-colors ${
                          subActive ? "text-gold-dark font-semibold" : "text-text-muted hover:text-ink hover:bg-blush-soft"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={`py-4 border-t border-border ${collapsed ? "px-3 flex justify-center" : "px-5"}`}>
        <Link href="/" title="View Live Site" className="flex items-center gap-2 text-[0.8rem] text-text-muted hover:text-gold-dark">
          <ArrowLeft size={14} />
          {!collapsed && <span>View Live Site</span>}
        </Link>
      </div>
    </div>
  );
}
