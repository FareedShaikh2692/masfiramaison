import { NextRequest, NextResponse } from "next/server";
import { readOrders } from "@/lib/orderStore";
import { listCustomers } from "@/lib/customerStore";
import { listProducts } from "@/lib/catalogStore";

export interface SearchResult {
  type: "order" | "customer" | "product";
  label: string;
  sublabel: string;
  href: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const [orders, customers, products] = await Promise.all([readOrders(), listCustomers(), listProducts()]);

  const orderResults: SearchResult[] = orders
    .filter((o) => o.orderId.toLowerCase().includes(q) || o.fullName.toLowerCase().includes(q) || o.phone.includes(q))
    .slice(-5)
    .reverse()
    .map((o) => ({ type: "order", label: o.orderId, sublabel: `${o.fullName} · ${o.productName}`, href: `/admin/orders/${o.orderId}` }));

  const customerResults: SearchResult[] = customers
    .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
    .slice(0, 5)
    .map((c) => ({ type: "customer", label: c.name, sublabel: c.phone, href: `/admin/customers/${encodeURIComponent(c.phone)}` }));

  const productResults: SearchResult[] = products
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({ type: "product", label: p.name, sublabel: p.price != null ? `₹${p.price}` : "Price on request", href: `/admin/products` }));

  return NextResponse.json({ results: [...orderResults, ...customerResults, ...productResults] });
}
