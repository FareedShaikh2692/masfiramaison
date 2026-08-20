import { NextRequest, NextResponse } from "next/server";
import { findOrderByReviewToken } from "@/lib/orderStore";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await findOrderByReviewToken(token);
  if (!order) return NextResponse.json({ error: "This review link is invalid or has expired." }, { status: 404 });

  return NextResponse.json({
    orderId: order.orderId,
    fullName: order.fullName,
    phone: order.phone,
    productId: order.productId || null,
    productName: order.productName
  });
}
