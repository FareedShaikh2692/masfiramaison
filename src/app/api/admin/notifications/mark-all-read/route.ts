import { NextResponse } from "next/server";
import { markAllNotificationsRead } from "@/lib/notificationStore";

export async function POST() {
  await markAllNotificationsRead();
  return NextResponse.json({ ok: true });
}
