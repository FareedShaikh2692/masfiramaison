import { NextRequest, NextResponse } from "next/server";
import { listMedia, createMediaAsset } from "@/lib/mediaStore";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const assets = await listMedia(search);
  return NextResponse.json({ assets });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.dataUrl) {
    return NextResponse.json({ error: "A name and image are required." }, { status: 400 });
  }
  try {
    const asset = await createMediaAsset({
      name: body.name,
      dataUrl: body.dataUrl,
      sourceType: body.sourceType || "upload",
      sourceUrl: body.sourceUrl || null
    });
    return NextResponse.json({ asset });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not save image." }, { status: 400 });
  }
}
