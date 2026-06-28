import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreSettings, updateStoreSettings } from "@/lib/shopify";

// GET /api/admin/settings — get current homepage/store layout settings
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const settings = await getStoreSettings();
    return NextResponse.json(settings);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/admin/settings — update homepage/store layout settings
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { heroVideoUrl, giftingTitle, giftingTagline } = body;

    await updateStoreSettings({
      heroVideoUrl,
      giftingTitle,
      giftingTagline,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
