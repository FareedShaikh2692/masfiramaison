import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateDeliveryZone, deleteDeliveryZone } from "@/lib/deliveryStore";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const zone = await updateDeliveryZone(id, body);
  if (!zone) return NextResponse.json({ error: "Zone not found." }, { status: 404 });
  revalidatePath("/", "layout");
  return NextResponse.json({ zone });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteDeliveryZone(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
