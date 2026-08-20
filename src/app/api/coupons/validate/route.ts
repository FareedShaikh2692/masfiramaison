import { NextRequest, NextResponse } from "next/server";
import { findActiveCouponByCode, evaluateCoupon } from "@/lib/couponStore";

export async function POST(req: NextRequest) {
  const { code, orderAmount, categoryId, productId } = await req.json();
  if (!code) return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });

  const coupon = await findActiveCouponByCode(code);
  if (!coupon) return NextResponse.json({ error: "This coupon code isn't valid." }, { status: 404 });

  const result = evaluateCoupon(coupon, { orderAmount: orderAmount || 0, categoryId, productId });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ couponId: coupon.id, code: coupon.code, discount: result.discount });
}
