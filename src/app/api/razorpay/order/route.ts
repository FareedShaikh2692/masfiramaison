import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import { readOrders } from "@/lib/orderStore";

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Online payment isn't set up yet — please use another payment method." }, { status: 503 });
  }

  const { orderId, amount } = await req.json();
  if (!orderId || !amount || amount <= 0) {
    return NextResponse.json({ error: "A valid order and amount are required." }, { status: 400 });
  }

  const orders = await readOrders();
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.total != null && amount > order.total) {
    return NextResponse.json({ error: "Amount can't exceed the order total." }, { status: 400 });
  }

  const razorpay = getRazorpayClient();
  const rpOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: orderId,
    notes: { masfiraOrderId: orderId }
  });

  return NextResponse.json({
    razorpayOrderId: rpOrder.id,
    amount: rpOrder.amount,
    currency: rpOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID
  });
}
