import { NextRequest, NextResponse } from "next/server";
import { listFlavors, createFlavor } from "@/lib/catalogStore";

export async function GET() {
  const flavors = await listFlavors();
  return NextResponse.json({ flavors });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "A flavor name is required." }, { status: 400 });
  }
  const flavor = await createFlavor(body.name, body.displayOrder ?? 0);
  return NextResponse.json({ flavor });
}
