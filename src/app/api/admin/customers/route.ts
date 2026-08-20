import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/customerStore";

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json({ customers });
}
