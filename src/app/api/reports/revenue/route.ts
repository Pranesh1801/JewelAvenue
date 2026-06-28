import { NextRequest, NextResponse } from "next/server";
import { shopifyAdmin } from "@/lib/shopify";

// GET /api/reports/revenue?period=daily|weekly|monthly&from=&to=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") || "daily";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = to ? new Date(to) : new Date();

  try {
    // Fetch orders within the date range from Shopify
    const queryFilter = `created_at:>='${dateFrom.toISOString()}' AND created_at:<='${dateTo.toISOString()}' AND financial_status:paid`;

    const data = await shopifyAdmin<{
      orders: {
        edges: Array<{
          node: {
            totalPriceSet: { shopMoney: { amount: string } };
            totalTaxSet: { shopMoney: { amount: string } };
            createdAt: string;
            lineItems: { edges: Array<{ node: { quantity: number } }> };
          };
        }>;
      };
    }>(`
      query RevenueReport($query: String!) {
        orders(first: 250, query: $query, sortKey: CREATED_AT) {
          edges {
            node {
              totalPriceSet { shopMoney { amount } }
              totalTaxSet { shopMoney { amount } }
              createdAt
              lineItems(first: 50) {
                edges { node { quantity } }
              }
            }
          }
        }
      }
    `, { query: queryFilter });

    // Group by period
    const grouped = new Map<string, { revenue: number; orders: number; items: number }>();

    for (const edge of data.orders.edges) {
      const order = edge.node;
      const key = formatPeriodKey(new Date(order.createdAt), period);
      const current = grouped.get(key) || { revenue: 0, orders: 0, items: 0 };
      current.revenue += parseFloat(order.totalPriceSet.shopMoney.amount);
      current.orders += 1;
      current.items += order.lineItems.edges.reduce((s, e) => s + e.node.quantity, 0);
      grouped.set(key, current);
    }

    const chartData = Array.from(grouped.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));

    // Summary
    const totalRevenue = data.orders.edges.reduce(
      (s, e) => s + parseFloat(e.node.totalPriceSet.shopMoney.amount),
      0
    );
    const totalOrders = data.orders.edges.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      period,
      from: dateFrom.toISOString(),
      to: dateTo.toISOString(),
      summary: { totalRevenue, totalOrders, avgOrderValue },
      data: chartData,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/reports/revenue] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function formatPeriodKey(date: Date, period: string): string {
  if (period === "monthly") return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  if (period === "weekly") {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10); // daily
}
