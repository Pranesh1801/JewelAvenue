import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cache, CacheKeys, CacheTTL } from "@/lib/cache";

// GET /api/reports/revenue?period=daily|weekly|monthly&from=&to=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") || "daily";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const cacheKey = CacheKeys.reportRevenue(`${period}:${from}:${to}`);
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = to ? new Date(to) : new Date();

  // Get orders in range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: dateFrom, lte: dateTo },
      status: { notIn: ["CANCELLED", "REFUNDED"] },
    },
    select: {
      totalAmount: true,
      taxAmount: true,
      createdAt: true,
      items: { select: { quantity: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by period
  const grouped = new Map<string, { revenue: number; orders: number; items: number }>();

  for (const order of orders) {
    const key = formatPeriodKey(order.createdAt, period);
    const current = grouped.get(key) || { revenue: 0, orders: 0, items: 0 };
    current.revenue += order.totalAmount;
    current.orders += 1;
    current.items += order.items.reduce((s, i) => s + i.quantity, 0);
    grouped.set(key, current);
  }

  const data = Array.from(grouped.entries()).map(([date, values]) => ({
    date,
    ...values,
    revenue: values.revenue / 100, // Convert paise to rupees
  }));

  // Summary stats
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0) / 100;
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const result = {
    period,
    from: dateFrom.toISOString(),
    to: dateTo.toISOString(),
    summary: { totalRevenue, totalOrders, avgOrderValue },
    data,
  };

  await cache.set(cacheKey, result, CacheTTL.REPORTS);

  return NextResponse.json(result);
}

function formatPeriodKey(date: Date, period: string): string {
  const d = new Date(date);
  if (period === "monthly") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (period === "weekly") {
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    return weekStart.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10); // daily
}
