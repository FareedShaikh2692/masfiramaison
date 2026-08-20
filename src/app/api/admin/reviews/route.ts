import { NextRequest, NextResponse } from "next/server";
import { listReviews, reviewStats, type ReviewStatus } from "@/lib/reviewStore";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") as ReviewStatus | null;
  const withStats = req.nextUrl.searchParams.get("stats") === "1";

  const [reviews, stats] = await Promise.all([
    listReviews(status ? { status } : {}),
    withStats ? reviewStats() : Promise.resolve(null)
  ]);

  return NextResponse.json({ reviews, stats });
}
