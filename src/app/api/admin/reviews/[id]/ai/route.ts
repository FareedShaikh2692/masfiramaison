import { NextRequest, NextResponse } from "next/server";
import { getReviewById, updateReview } from "@/lib/reviewStore";
import { analyzeReview, generateReply, aiEnabled, type ReplyAction } from "@/lib/ai";

const REPLY_ACTIONS: ReplyAction[] = ["generate", "regenerate", "shorter", "more_professional", "more_friendly", "personal_touch"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!aiEnabled()) {
    return NextResponse.json({ error: "AI replies aren't configured yet — add an ANTHROPIC_API_KEY to enable this." }, { status: 503 });
  }

  const { id } = await params;
  const review = await getReviewById(id);
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  const { action, draft } = await req.json();

  try {
    if (action === "analyze") {
      const analysis = await analyzeReview(review);
      const updated = await updateReview(id, {
        sentiment: analysis.sentiment,
        topics: analysis.topics,
        aiSummary: analysis.summary,
        moderationFlag: analysis.moderationFlag
      });
      return NextResponse.json({ review: updated });
    }

    if (REPLY_ACTIONS.includes(action)) {
      const responseText = await generateReply(review, action, draft);
      const updated = await updateReview(id, { responseText, responseStatus: "ai_draft", responseGeneratedBy: "ai" });
      return NextResponse.json({ review: updated });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "AI request failed." }, { status: 502 });
  }
}
