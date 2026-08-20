import { NextRequest, NextResponse } from "next/server";
import { readOrders } from "@/lib/orderStore";
import { listProducts, listCategories } from "@/lib/catalogStore";
import { filterByRange } from "@/lib/dateRange";

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") || "30d";
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const [orders, products, categories] = await Promise.all([readOrders(), listProducts(), listCategories()]);
  const filtered = filterByRange(orders, range, from, to);
  const categoryNameByProductId = new Map(
    products.map((p) => [p.id, categories.find((c) => c.slug === p.category)?.name || "Uncategorized"])
  );

  // Revenue & order count per day (advancePaid counted as revenue on the day it was recorded).
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (const o of filtered) {
    const day = o.createdAt.slice(0, 10);
    const entry = byDay.get(day) || { revenue: 0, orders: 0 };
    entry.orders += 1;
    entry.revenue += o.advancePaid || 0;
    byDay.set(day, entry);
  }
  const series = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }));

  // Most popular products.
  const productCounts = new Map<string, { orders: number; revenue: number }>();
  for (const o of filtered) {
    const entry = productCounts.get(o.productName) || { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += o.total || 0;
    productCounts.set(o.productName, entry);
  }
  const topProducts = [...productCounts.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  // Category performance — joined via each order's productId, since custom-cake
  // orders and legacy orders without a productId fall back to "Uncategorized".
  const categoryCounts = new Map<string, { orders: number; revenue: number }>();
  for (const o of filtered) {
    const categoryName = (o.productId && categoryNameByProductId.get(o.productId)) || "Uncategorized";
    const entry = categoryCounts.get(categoryName) || { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += o.total || 0;
    categoryCounts.set(categoryName, entry);
  }
  const categoryPerformance = [...categoryCounts.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalOrders = filtered.length;
  const totalRevenue = filtered.reduce((sum, o) => sum + (o.advancePaid || 0), 0);
  const avgOrderValue = totalOrders ? Math.round(filtered.reduce((s, o) => s + (o.total || 0), 0) / totalOrders) : 0;

  return NextResponse.json({
    series,
    topProducts,
    categoryPerformance,
    totalOrders,
    totalRevenue,
    avgOrderValue
  });
}
