import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/shopify";
import { prisma } from "@/lib/db";

// GET /api/admin/stats — dashboard statistics
export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get Shopify stats (products, orders, revenue)
    const shopifyStats = await getDashboardStats();

    // Get user count from Supabase (users still in our DB)
    let totalUsers = 0;
    try {
      totalUsers = await prisma.user.count();
    } catch (err) {
      console.warn("[/api/admin/stats] Database user count failed, falling back to 0. Error:", err);
    }

    return NextResponse.json({
      ...shopifyStats,
      totalUsers,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
