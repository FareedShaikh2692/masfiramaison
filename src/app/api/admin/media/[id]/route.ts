import { NextRequest, NextResponse } from "next/server";
import { deleteMediaAsset } from "@/lib/mediaStore";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteMediaAsset(id);
  return NextResponse.json({ ok: true });
}
