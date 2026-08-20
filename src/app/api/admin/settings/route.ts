import { NextRequest, NextResponse } from "next/server";
import { getBusinessSettings, saveBusinessSettings, getTerms, saveTerms } from "@/lib/settingsStore";

export async function GET() {
  const [business, terms] = await Promise.all([getBusinessSettings(), getTerms()]);
  return NextResponse.json({ business, terms });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (body.business) await saveBusinessSettings(body.business);
  if (body.terms) await saveTerms(body.terms);
  const [business, terms] = await Promise.all([getBusinessSettings(), getTerms()]);
  return NextResponse.json({ business, terms });
}
