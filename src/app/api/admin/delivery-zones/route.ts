import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { listDeliveryZones, createDeliveryZone } from "@/lib/deliveryStore";

export async function GET() {
  const zones = await listDeliveryZones();
  return NextResponse.json({ zones });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "A zone name is required." }, { status: 400 });
  }
  const zone = await createDeliveryZone({
    name: body.name,
    chargeType: body.chargeType || "fixed",
    fixedCharge: body.fixedCharge ?? null,
    minCharge: body.minCharge ?? null,
    maxCharge: body.maxCharge ?? null,
    active: body.active,
    displayOrder: body.displayOrder
  });
  revalidatePath("/", "layout");
  return NextResponse.json({ zone });
}
