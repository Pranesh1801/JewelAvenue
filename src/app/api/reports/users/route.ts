import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/reports/users — user analytics
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = to ? new Date(to) : new Date();

  // Total users
  const totalUsers = await prisma.user.count();

  // New users in period
  const newUsers = await prisma.user.count({
    where: { createdAt: { gte: dateFrom, lte: dateTo } },
  });

  // Users with orders
  const usersWithOrders = await prisma.user.count({
    where: { orders: { some: {} } },
  });

  // Users with active carts
  const usersWithCarts = await prisma.user.count({
    where: { cartItems: { some: {} } },
  });

  // Daily signups in range
  const signups = await prisma.user.findMany({
    where: { createdAt: { gte: dateFrom, lte: dateTo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const dailySignups = new Map<string, number>();
  for (const user of signups) {
    const key = user.createdAt.toISOString().slice(0, 10);
    dailySignups.set(key, (dailySignups.get(key) || 0) + 1);
  }

  // Cart abandonment: users with cart items but no orders
  const cartAbandonment = await prisma.user.count({
    where: {
      cartItems: { some: {} },
      orders: { none: {} },
    },
  });

  return NextResponse.json({
    summary: {
      totalUsers,
      newUsers,
      usersWithOrders,
      usersWithCarts,
      cartAbandonment,
      conversionRate: totalUsers > 0 ? ((usersWithOrders / totalUsers) * 100).toFixed(1) : "0",
    },
    dailySignups: Array.from(dailySignups.entries()).map(([date, count]) => ({
      date,
      count,
    })),
  });
}
