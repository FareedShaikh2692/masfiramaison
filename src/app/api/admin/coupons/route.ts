import { NextRequest, NextResponse } from "next/server";
import { listCoupons, createCoupon } from "@/lib/couponStore";

export async function GET() {
  const coupons = await listCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.code || !String(body.code).trim()) {
    return NextResponse.json({ error: "A coupon code is required." }, { status: 400 });
  }
  try {
    const coupon = await createCoupon({
      code: body.code,
      discountType: body.discountType || "percentage",
      discountValue: Number(body.discountValue) || 0,
      minOrderAmount: body.minOrderAmount === "" || body.minOrderAmount == null ? null : Number(body.minOrderAmount),
      categoryId: body.categoryId || null,
      productId: body.productId || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      usageLimit: body.usageLimit === "" || body.usageLimit == null ? null : Number(body.usageLimit),
      active: body.active
    });
    return NextResponse.json({ coupon });
  } catch (err) {
    const message = err instanceof Error && err.message.includes("duplicate") ? "A coupon with this code already exists." : "Could not create coupon.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
