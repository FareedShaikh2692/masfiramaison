import { NextResponse } from "next/server";
import { listNotifications, countUnreadNotifications } from "@/lib/notificationStore";

export async function GET() {
  const [notifications, unreadCount] = await Promise.all([listNotifications(), countUnreadNotifications()]);
  return NextResponse.json({ notifications, unreadCount });
}
