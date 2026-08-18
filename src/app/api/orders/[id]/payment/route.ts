import { NextRequest, NextResponse } from "next/server";
import { updateOrder, saveUploadedImage } from "@/lib/orderStore";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!body.paymentMethod || !body.paymentScreenshot) {
    return NextResponse.json({ error: "Payment method and screenshot are required." }, { status: 400 });
  }

  const filename = await saveUploadedImage(body.paymentScreenshot, "payment");
  if (!filename) {
    return NextResponse.json({ error: "Could not read payment screenshot." }, { status: 400 });
  }

  const updated = await updateOrder(id, {
    paymentMethod: body.paymentMethod,
    paymentScreenshot: filename,
    status: "payment_verification"
  });

  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ orderId: updated.orderId, status: updated.status });
}
