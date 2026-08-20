import { NextRequest, NextResponse } from "next/server";
import { readOrders } from "@/lib/orderStore";

const RANGE_DAYS: Record<string, number | null> = {
  today: 0,
  yesterday: 1,
  "7d": 7,
  "30d": 30,
  all: null
};

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") || "30d";
  const orders = await readOrders();

  let filtered = orders;
  const days = RANGE_DAYS[range];
  if (days != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    if (range === "yesterday") {
      const startOfYesterday = new Date(cutoff);
      const endOfYesterday = new Date(cutoff);
      endOfYesterday.setDate(endOfYesterday.getDate() + 1);
      filtered = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= startOfYesterday && d < endOfYesterday;
      });
    } else if (range === "today") {
      filtered = orders.filter((o) => new Date(o.createdAt) >= cutoff);
    } else {
      filtered = orders.filter((o) => new Date(o.createdAt) >= cutoff);
    }
  }

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
