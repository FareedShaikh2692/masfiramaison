import { NextRequest, NextResponse } from "next/server";
import { updateOrder, saveUploadedImage, readOrders } from "@/lib/orderStore";
import type { OrderStatus } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!body.paymentMethod) {
    return NextResponse.json({ error: "Payment method is required." }, { status: 400 });
  }

  const isCash = body.paymentMethod === "cash";

  if (!isCash && !body.paymentScreenshot) {
    return NextResponse.json({ error: "A payment screenshot is required for online payment methods." }, { status: 400 });
  }

  let screenshot: string | null = null;
  if (!isCash) {
    screenshot = await saveUploadedImage(body.paymentScreenshot);
    if (!screenshot) {
      return NextResponse.json({ error: "Could not read payment screenshot — it may be too large or an unsupported format." }, { status: 400 });
    }
  }

  const orders = await readOrders();
  const existing = orders.find((o) => o.orderId === id);
  if (!existing) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const advancePaid: number | null = isCash ? null : (typeof body.advancePaid === "number" ? body.advancePaid : existing.total);
  const balanceDue: number | null =
    existing.total != null && advancePaid != null ? Math.max(existing.total - advancePaid, 0) : existing.total;

  // Cash orders have no online proof to verify — they stay "payment_pending" (cash is
  // collected at pickup) rather than moving into the manual-verification queue.
  const status: OrderStatus = isCash ? "payment_pending" : "payment_verification";

  const updated = await updateOrder(id, {
    paymentMethod: body.paymentMethod,
    paymentScreenshot: screenshot,
    advancePaid,
    balanceDue,
    status
  });

  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ orderId: updated.orderId, status: updated.status });
}
