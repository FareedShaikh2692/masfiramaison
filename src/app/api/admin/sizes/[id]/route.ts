import { NextRequest, NextResponse } from "next/server";
import { updateSizePreset, deleteSizePreset } from "@/lib/catalogStore";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const size = await updateSizePreset(id, body);
  if (!size) return NextResponse.json({ error: "Size not found." }, { status: 404 });
  return NextResponse.json({ size });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteSizePreset(id);
  return NextResponse.json({ ok: true });
}
