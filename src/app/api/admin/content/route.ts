import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getHeroBanner, saveHeroBanner, getOffers, saveOffers } from "@/lib/contentStore";

export async function GET() {
  const [banner, offers] = await Promise.all([getHeroBanner(), getOffers()]);
  return NextResponse.json({ banner, offers });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (body.banner) await saveHeroBanner(body.banner);
  if (body.offers) await saveOffers(body.offers);
  const [banner, offers] = await Promise.all([getHeroBanner(), getOffers()]);
  revalidatePath("/", "layout");
  return NextResponse.json({ banner, offers });
}
