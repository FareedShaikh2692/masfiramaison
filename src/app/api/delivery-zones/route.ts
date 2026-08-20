import { NextResponse } from "next/server";
import { listDeliveryZones } from "@/lib/deliveryStore";

export async function GET() {
  const zones = await listDeliveryZones({ activeOnly: true });
  return NextResponse.json({ zones });
}
