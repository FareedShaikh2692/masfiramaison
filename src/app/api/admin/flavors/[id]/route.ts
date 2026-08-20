import { NextRequest, NextResponse } from "next/server";
import { updateFlavor, deleteFlavor } from "@/lib/catalogStore";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const flavor = await updateFlavor(id, body);
  if (!flavor) return NextResponse.json({ error: "Flavor not found." }, { status: 404 });
  return NextResponse.json({ flavor });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteFlavor(id);
  return NextResponse.json({ ok: true });
}
