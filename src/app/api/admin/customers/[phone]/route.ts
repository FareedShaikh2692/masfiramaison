import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrders, saveCustomerNotes } from "@/lib/customerStore";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  const orders = await getCustomerOrders(decodeURIComponent(phone));
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  const body = await req.json();
  await saveCustomerNotes(decodeURIComponent(phone), body.notes || "");
  return NextResponse.json({ ok: true });
}
