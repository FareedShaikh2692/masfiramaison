import Anthropic from "@anthropic-ai/sdk";
import type { ReviewRecord } from "@/lib/reviewStore";

const MODEL = "claude-sonnet-4-5";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");
  return new Anthropic({ apiKey });
}

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const TOPIC_OPTIONS = ["Taste", "Design", "Packaging", "Delivery", "Pricing", "Customer Service", "Quality", "Presentation"];

const SERIOUS_KEYWORDS = [
  "allerg", "sick", "illness", "food poison", "hospital", "refund", "lawsuit", "legal", "sue",
  "fraud", "scam", "harass", "threat", "police", "unsafe", "contaminat"
];

export interface ReviewAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  summary: string;
  moderationFlag: "needs_human_attention" | null;
}

export async function analyzeReview(review: ReviewRecord): Promise<ReviewAnalysis> {
  const client = getClient();
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system:
      "You are a review analysis assistant for a home bakery called Masfira Maison. " +
      "Analyze the customer review and respond with ONLY a JSON object, no other text, matching this shape: " +
      `{"sentiment": "positive" | "neutral" | "negative", "topics": string[] (choose only from: ${TOPIC_OPTIONS.join(", ")}), "summary": string (one sentence, for internal admin use only), "needsHumanAttention": boolean}. ` +
      "Set needsHumanAttention to true only for serious issues: food safety concerns, allergic reactions, illness, payment disputes, legal threats, harassment, or fraud claims.",
    messages: [
      {
        role: "user",
        content: `Rating: ${review.rating}/5\nReview: ${review.reviewText}`
      }
    ]
  });

  const text = message.content.find((b) => b.type === "text")?.text || "{}";
  let parsed: { sentiment?: string; topics?: string[]; summary?: string; needsHumanAttention?: boolean } = {};
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    parsed = {};
  }

  const keywordFlag = SERIOUS_KEYWORDS.some((k) => review.reviewText.toLowerCase().includes(k));

  return {
    sentiment: (parsed.sentiment as ReviewAnalysis["sentiment"]) || "neutral",
    topics: (parsed.topics || []).filter((t) => TOPIC_OPTIONS.includes(t)),
    summary: parsed.summary || "",
    moderationFlag: parsed.needsHumanAttention || keywordFlag ? "needs_human_attention" : null
  };
}

export type ReplyAction = "generate" | "regenerate" | "shorter" | "more_professional" | "more_friendly" | "personal_touch";

const SYSTEM_PROMPT = `You write customer review replies for Masfira Maison, a premium home bakery, in the voice of a real Masfira Maison team member.

TONE: warm, friendly, professional, appreciative, personal, elegant, human, concise.
AVOID: robotic language, generic copy-paste phrasing, excessive emojis (at most one), overly promotional language, arguing with the customer, blaming the customer.

RULES YOU MUST NEVER BREAK:
- Never invent facts about the order, product, or business.
- Never promise refunds, compensation, or discounts.
- Never admit legal liability or fault for anything beyond a general apology for a bad experience.
- Never reveal private customer information.
- Never mention internal systems, processes, or that this response was written by AI.
- Never argue with or contradict the customer's account of events.

RESPONSE STYLE BY RATING:
5 stars: Be highly appreciative. Thank the customer and reference something specific and positive from their review.
4 stars: Thank them warmly and acknowledge the positive experience; gently address anything they suggest could improve, without being defensive.
3 stars: Be polite and empathetic. Acknowledge both the positive and negative points. Invite them to reach out directly if appropriate.
2 stars: Apologize sincerely for the disappointing experience and acknowledge their specific concerns. Do not become defensive. Offer to understand the issue better via direct contact.
1 star: Use a very professional, empathetic tone. Apologize that the experience did not meet expectations, thank them for the feedback, and invite them to reach out directly with their order details so the issue can be looked into — without promising any specific resolution.

Output ONLY the reply text — no preamble, no quotation marks, no labels.`;

export async function generateReply(review: ReviewRecord, action: ReplyAction, currentDraft?: string): Promise<string> {
  const client = getClient();

  const context = `Customer: ${review.customerName}\nRating: ${review.rating}/5\nProduct: ${review.productName || "Not specified"}\nOccasion: ${review.occasion || "Not specified"}\nReview: ${review.reviewText}`;

  let instruction = "Write a reply to this review.";
  if (action === "regenerate") instruction = "Write a fresh, different reply to this review.";
  if (action === "shorter") instruction = `Rewrite this draft reply to be noticeably shorter, keeping the same warmth and meaning:\n\n${currentDraft}`;
  if (action === "more_professional") instruction = `Rewrite this draft reply to sound more professional and polished, while staying warm:\n\n${currentDraft}`;
  if (action === "more_friendly") instruction = `Rewrite this draft reply to sound warmer and more friendly, while staying professional:\n\n${currentDraft}`;
  if (action === "personal_touch") instruction = `Rewrite this draft reply to feel more personal and specific to this customer's experience:\n\n${currentDraft}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `${context}\n\n${instruction}` }]
  });

  return message.content.find((b) => b.type === "text")?.text.trim() || "";
}
