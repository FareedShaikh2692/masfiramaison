import { NextRequest, NextResponse } from "next/server";
import { readOrders, updateOrder } from "@/lib/orderStore";
import { createNotification } from "@/lib/notificationStore";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "payment_pending",
  "payment_verification",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled"
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["pending", "partially_paid", "paid", "failed", "refunded"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const orders = await readOrders();
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const body = await req.json();

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  if (body.paymentStatus && !VALID_PAYMENT_STATUSES.includes(body.paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  if (body.paymentStatus) patch.paymentStatus = body.paymentStatus;
  if (typeof body.advancePaid === "number" || body.advancePaid === null) patch.advancePaid = body.advancePaid;
  if (typeof body.itemPrice === "number" || body.itemPrice === null) patch.itemPrice = body.itemPrice;
  if (typeof body.customDesignCharge === "number" || body.customDesignCharge === null) patch.customDesignCharge = body.customDesignCharge;
  if (typeof body.deliveryCharge === "number" || body.deliveryCharge === null) patch.deliveryCharge = body.deliveryCharge;
  if (typeof body.total === "number" || body.total === null) patch.total = body.total;
  if (typeof body.adminNote === "string") patch.adminNote = body.adminNote;

  const order = await updateOrder(orderId, patch);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (body.status === "cancelled") {
    await createNotification({
      type: "order_cancelled",
      title: "Order cancelled",
      message: `Order ${order.orderId} for ${order.fullName} was cancelled.`,
      orderId: order.orderId
    });
  }

  return NextResponse.json({ order });
}
