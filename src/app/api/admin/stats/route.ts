import { NextRequest, NextResponse } from "next/server";
import { readOrders } from "@/lib/orderStore";
import { filterByRange } from "@/lib/dateRange";

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") || "30d";
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const orders = await readOrders();
  const filtered = filterByRange(orders, range, from, to);

  const byStatus = (status: string) => filtered.filter((o) => o.status === status).length;

  const confirmedLike = filtered.filter((o) => ["confirmed", "preparing", "ready", "completed"].includes(o.status));
  const totalRevenue = confirmedLike.reduce((sum, o) => sum + (o.advancePaid || 0), 0);
  const pendingPayments = filtered
    .filter((o) => ["pending", "payment_pending", "payment_verification"].includes(o.status))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const uniqueCustomers = new Set(filtered.map((o) => o.phone)).size;

  return NextResponse.json({
    totalOrders: filtered.length,
    pendingOrders: byStatus("pending") + byStatus("payment_pending"),
    paymentVerificationOrders: byStatus("payment_verification"),
    confirmedOrders: byStatus("confirmed"),
    preparingOrders: byStatus("preparing"),
    readyOrders: byStatus("ready"),
    completedOrders: byStatus("completed"),
    cancelledOrders: byStatus("cancelled"),
    totalCustomers: uniqueCustomers,
    totalRevenue,
    pendingPayments,
    averageOrderValue: filtered.length ? Math.round(filtered.reduce((s, o) => s + (o.total || 0), 0) / filtered.length) : 0
  });
}
