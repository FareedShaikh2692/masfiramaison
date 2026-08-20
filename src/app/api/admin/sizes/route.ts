import { NextRequest, NextResponse } from "next/server";
import { listSizePresets, createSizePreset } from "@/lib/catalogStore";

export async function GET() {
  const sizes = await listSizePresets();
  return NextResponse.json({ sizes });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.label || !String(body.label).trim()) {
    return NextResponse.json({ error: "A size label is required." }, { status: 400 });
  }
  const size = await createSizePreset(body.label, body.displayOrder ?? 0);
  return NextResponse.json({ size });
}
