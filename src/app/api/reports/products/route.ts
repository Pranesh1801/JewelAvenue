import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cache, CacheKeys, CacheTTL } from "@/lib/cache";

// GET /api/reports/products — top sellers, category breakdown
export async function GET() {
  const cacheKey = CacheKeys.reportProducts();
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  // Top selling products
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true, unitPrice: true },
    _count: true,
    orderBy: { _sum: { quantity: "desc" } },
    take: 20,
  });

  // Enrich with product names
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, displayPrice: true, categoryId: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const topSellers = topProducts.map((tp) => {
    const product = productMap.get(tp.productId);
    return {
      productId: tp.productId,
      name: product?.name || "Unknown",
      displayPrice: product?.displayPrice || "",
      totalQuantity: tp._sum.quantity || 0,
      totalRevenue: (tp._sum.unitPrice || 0) / 100,
      orderCount: tp._count,
    };
  });

  // Category breakdown
  const categoryBreakdown = await prisma.category.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      _count: { select: { products: true } },
      products: {
        select: {
          orderItems: {
            select: { quantity: true, unitPrice: true },
          },
        },
      },
    },
  });

  const categories = categoryBreakdown.map((cat) => {
    const totalSold = cat.products.reduce(
      (sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.quantity, 0),
      0
    );
    const totalRevenue = cat.products.reduce(
      (sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.unitPrice * oi.quantity, 0),
      0
    );
    return {
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      productCount: cat._count.products,
      totalSold,
      totalRevenue: totalRevenue / 100,
    };
  });

  // Low stock alerts
  const lowStock = await prisma.product.findMany({
    where: { stock: { lt: 10 }, isActive: true },
    select: { id: true, name: true, stock: true, styleCode: true },
    orderBy: { stock: "asc" },
  });

  const result = { topSellers, categories, lowStock };
  await cache.set(cacheKey, result, CacheTTL.REPORTS);

  return NextResponse.json(result);
}
