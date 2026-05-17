import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cache, CacheKeys, CacheTTL } from "@/lib/cache";

// GET /api/products/:id — single product with full details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check cache
  const cacheKey = CacheKeys.product(id);
  const cached = await cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      customizations: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await cache.set(cacheKey, product, CacheTTL.PRODUCT_DETAIL);

  return NextResponse.json(product);
}
