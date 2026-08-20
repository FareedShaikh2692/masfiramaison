import { NextRequest, NextResponse } from "next/server";
import { updateCoupon, deleteCoupon } from "@/lib/couponStore";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const coupon = await updateCoupon(id, body);
  if (!coupon) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  return NextResponse.json({ coupon });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteCoupon(id);
  return NextResponse.json({ ok: true });
}
