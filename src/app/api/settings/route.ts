import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/shopify";

// GET /api/settings — public route to fetch current banner/hero settings
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(settings);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
