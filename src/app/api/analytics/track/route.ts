import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/analytics/track — record analytics event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, userId, sessionId, productId, metadata } = body;

    if (!eventType) {
      return NextResponse.json({ error: "eventType required" }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId: userId || null,
        sessionId: sessionId || null,
        productId: productId || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    // Analytics should never cause errors for the user
    return NextResponse.json({ success: true });
  }
}
