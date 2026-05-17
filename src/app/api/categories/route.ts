import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cache, CacheKeys, CacheTTL } from "@/lib/cache";

// GET /api/categories — all categories with product counts
export async function GET() {
  // Check cache
  const cacheKey = CacheKeys.categories();
  const cached = await cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: { where: { isActive: true } } },
      },
    },
  });

  const result = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    title: cat.title,
    tagline: cat.tagline,
    iconType: cat.iconType,
    href: cat.href,
    sortOrder: cat.sortOrder,
    productCount: cat._count.products,
  }));

  await cache.set(cacheKey, result, CacheTTL.CATEGORIES);

  return NextResponse.json(result);
}
