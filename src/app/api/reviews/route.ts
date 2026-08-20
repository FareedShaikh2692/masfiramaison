import { NextRequest, NextResponse } from "next/server";
import { createReview } from "@/lib/reviewStore";
import { getReviewSettings } from "@/lib/settingsStore";
import { findOrderByReviewToken } from "@/lib/orderStore";

export async function POST(req: NextRequest) {
  const settings = await getReviewSettings();
  if (!settings.enabled) return NextResponse.json({ error: "Reviews are currently disabled." }, { status: 403 });

  const body = await req.json();

  if (!body.customerName || !String(body.customerName).trim()) {
    return NextResponse.json({ error: "Your name is required." }, { status: 400 });
  }
  const rating = Number(body.rating);
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please choose a star rating." }, { status: 400 });
  }
  if (!body.reviewText || !String(body.reviewText).trim()) {
    return NextResponse.json({ error: "Please share a few words about your experience." }, { status: 400 });
  }

  const images: string[] = Array.isArray(body.images)
    ? body.images.filter((i: unknown) => typeof i === "string" && i.startsWith("data:image")).slice(0, settings.maxPhotos)
    : [];

  let isVerified = false;
  let orderId: string | null = body.orderId || null;
  let productName: string | null = body.productName || null;

  if (body.reviewToken) {
    const order = await findOrderByReviewToken(body.reviewToken);
    if (order) {
      isVerified = true;
      orderId = order.orderId;
      productName = order.productName;
    }
  } else if (orderId) {
    // Manually entered order ID — do not verify without a matching completed order lookup by token.
    isVerified = false;
  }

  const review = await createReview(
    {
      customerName: body.customerName,
      customerPhone: body.customerPhone || null,
      orderId,
      productId: body.productId || null,
      productName,
      occasion: body.occasion || null,
      rating,
      reviewText: body.reviewText,
      images: settings.allowPhotos ? images : [],
      isVerified
    },
    settings.requireApproval
  );

  return NextResponse.json({ id: review.id, status: review.status });
}
