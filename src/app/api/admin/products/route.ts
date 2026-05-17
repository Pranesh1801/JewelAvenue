import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cache } from "@/lib/cache";

// GET /api/admin/products — all products for admin (includes inactive)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
  const search = searchParams.get("search") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { styleCode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, title: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
        customizations: true,
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
}

// POST /api/admin/products — create product
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    name, price, displayPrice, subtitle, description, styleCode,
    goldWeight, netWeight, diamondCount, diamondWeight, purity,
    bestseller, stock, categoryId, images, customizations,
  } = body;

  if (!name || !styleCode || !categoryId) {
    return NextResponse.json({ error: "name, styleCode, categoryId are required" }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price: price || 0,
        displayPrice: displayPrice || `₹${((price || 0) / 100).toLocaleString("en-IN")}`,
        subtitle,
        description,
        styleCode,
        goldWeight,
        netWeight,
        diamondCount,
        diamondWeight,
        purity,
        bestseller: bestseller || false,
        stock: stock ?? 100,
        categoryId,
        images: images?.length ? {
          create: images.map((img: { url: string; isHover?: boolean }, i: number) => ({
            url: img.url,
            sortOrder: i,
            isHover: img.isHover || false,
          })),
        } : undefined,
        customizations: customizations?.length ? {
          create: customizations.map((c: { type: string; value: string }) => ({
            type: c.type,
            value: c.value,
          })),
        } : undefined,
      },
      include: { images: true, customizations: true, category: true },
    });

    // Invalidate product caches
    await cache.invalidate("products:*");
    await cache.invalidate("report:*");

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A product with this style code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
