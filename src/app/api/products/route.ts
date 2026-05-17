import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cache, CacheKeys, CacheTTL } from "@/lib/cache";

// GET /api/products — paginated product list with filters
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category = searchParams.get("category");
  const bestseller = searchParams.get("bestseller");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "sortOrder_asc";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const active = searchParams.get("active") !== "false"; // default: only active products

  // Build cache key from params
  const cacheKey = CacheKeys.products(
    `${category}:${bestseller}:${search}:${sort}:${page}:${limit}:${active}`
  );

  // Check cache
  const cached = await cache.get<{ products: unknown[]; total: number }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (active) where.isActive = true;
  if (category) {
    where.category = { slug: category };
  }
  if (bestseller === "true") where.bestseller = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { styleCode: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  const [sortField, sortDir] = sort.split("_");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderBy: any = {};
  if (sortField === "price") orderBy.price = sortDir === "desc" ? "desc" : "asc";
  else if (sortField === "name") orderBy.name = sortDir === "desc" ? "desc" : "asc";
  else if (sortField === "createdAt") orderBy.createdAt = sortDir === "desc" ? "desc" : "asc";
  else orderBy.sortOrder = "asc";

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { slug: true, title: true } },
        images: { orderBy: { sortOrder: "asc" } },
        customizations: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  const result = {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Cache result
  await cache.set(cacheKey, result, CacheTTL.PRODUCTS_LIST);

  return NextResponse.json(result);
}
