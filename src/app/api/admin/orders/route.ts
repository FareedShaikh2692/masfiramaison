import { NextRequest, NextResponse } from "next/server";
import { readOrders } from "@/lib/orderStore";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const paymentStatus = searchParams.get("paymentStatus");
  const search = searchParams.get("search")?.toLowerCase().trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));

  let orders = await readOrders();
  orders = orders.slice().reverse(); // newest first

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }
  if (paymentStatus && paymentStatus !== "all") {
    orders = orders.filter((o) => (o.paymentStatus || "pending") === paymentStatus);
  }
  if (search) {
    orders = orders.filter(
      (o) =>
        o.orderId.toLowerCase().includes(search) ||
        o.fullName.toLowerCase().includes(search) ||
        o.phone.includes(search) ||
        o.productName.toLowerCase().includes(search)
    );
  }

  const total = orders.length;
  const start = (page - 1) * pageSize;
  const pageItems = orders.slice(start, start + pageSize);

  return NextResponse.json({ orders: pageItems, total, page, pageSize });
}
