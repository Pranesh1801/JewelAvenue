import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/stats — dashboard statistics
export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalProducts, totalCategories, totalOrders, totalUsers, revenueAgg, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  return NextResponse.json({
    totalProducts,
    totalCategories,
    totalOrders,
    totalUsers,
    totalRevenue: revenueAgg._sum.totalAmount || 0,
    recentOrders,
  });
}
