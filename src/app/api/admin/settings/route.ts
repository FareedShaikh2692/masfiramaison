import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBusinessSettings, saveBusinessSettings, getTerms, saveTerms, getReviewSettings, saveReviewSettings } from "@/lib/settingsStore";

export async function GET() {
  const [business, terms, reviewSettings] = await Promise.all([getBusinessSettings(), getTerms(), getReviewSettings()]);
  return NextResponse.json({ business, terms, reviewSettings });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (body.business) await saveBusinessSettings(body.business);
  if (body.terms) await saveTerms(body.terms);
  if (body.reviewSettings) await saveReviewSettings(body.reviewSettings);
  const [business, terms, reviewSettings] = await Promise.all([getBusinessSettings(), getTerms(), getReviewSettings()]);
  revalidatePath("/", "layout");
  return NextResponse.json({ business, terms, reviewSettings });
}
