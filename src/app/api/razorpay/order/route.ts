import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import { readOrders } from "@/lib/orderStore";

const MIN_AMOUNT_RUPEES = 1; // Razorpay's minimum order amount is 100 paise.

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Online payment isn't set up yet — please use another payment method." }, { status: 503 });
  }

  const { orderId, amount } = await req.json();
  if (!orderId || !amount || amount < MIN_AMOUNT_RUPEES) {
    return NextResponse.json({ error: `A valid order and an amount of at least ₹${MIN_AMOUNT_RUPEES} are required.` }, { status: 400 });
  }

  const orders = await readOrders();
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.total != null && amount > order.total) {
    return NextResponse.json({ error: "Amount can't exceed the order total." }, { status: 400 });
  }

  try {
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
  } catch (err) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 401) {
      return NextResponse.json({ error: "Payment gateway authentication failed. Check the configured Razorpay keys." }, { status: 401 });
    }
    const description = (err as { error?: { description?: string } })?.error?.description;
    return NextResponse.json({ error: description || "Could not create the payment order. Please try again." }, { status: 500 });
  }
}
