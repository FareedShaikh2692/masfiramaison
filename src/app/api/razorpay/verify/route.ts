import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature, isRazorpayConfigured } from "@/lib/razorpay";
import { updateOrder, readOrders } from "@/lib/orderStore";
import { createNotification } from "@/lib/notificationStore";
import type { PaymentEvent } from "@/lib/types";

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Online payment isn't set up yet." }, { status: 503 });
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification details." }, { status: 400 });
  }

  const valid = verifyRazorpaySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature
  });

  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed. Please contact us on WhatsApp." }, { status: 400 });
  }

  const orders = await readOrders();
  const existing = orders.find((o) => o.orderId === orderId);
  if (!existing) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const event: PaymentEvent = {
    at: new Date().toISOString(),
    method: "upi",
    amount,
    status: "paid",
    reference: razorpay_payment_id,
    note: "Verified automatically via Razorpay signature"
  };

  // A verified signature is real, cryptographic proof the payment succeeded —
  // this is the one path in the app allowed to confirm an order automatically.
  const order = await updateOrder(orderId, {
    paymentMethod: "upi",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    advancePaid: amount,
    status: "confirmed",
    paymentStatus: "paid",
    paymentHistory: [...(existing.paymentHistory || []), event]
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const balanceDue = order.total != null ? Math.max(order.total - (order.advancePaid ?? 0), 0) : null;
  await updateOrder(orderId, { balanceDue });

  await createNotification({
    type: "payment_received",
    title: "Payment verified — order confirmed",
    message: `${order.fullName}'s payment of ₹${amount} was verified automatically. Order confirmed.`,
    orderId: order.orderId
  });

  return NextResponse.json({ orderId: order.orderId, status: "confirmed" });
}
