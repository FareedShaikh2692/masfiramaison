import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getReviewById, updateReview, deleteReview, type ReviewPatch } from "@/lib/reviewStore";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await getReviewById(id);
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  return NextResponse.json({ review });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const patch: ReviewPatch = {};
  if (body.status) patch.status = body.status;
  if (typeof body.showInGallery === "boolean") patch.showInGallery = body.showInGallery;
  if (typeof body.responseText === "string" || body.responseText === null) patch.responseText = body.responseText;
  if (body.responseStatus) patch.responseStatus = body.responseStatus;
  if (body.responseGeneratedBy) patch.responseGeneratedBy = body.responseGeneratedBy;
  if (body.responseStatus === "published") patch.responsePublishedAt = new Date().toISOString();

  const review = await updateReview(id, patch);
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  revalidatePath("/", "layout");
  return NextResponse.json({ review });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteReview(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
