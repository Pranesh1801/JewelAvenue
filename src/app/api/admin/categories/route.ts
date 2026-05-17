import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cache } from "@/lib/cache";

// GET /api/admin/categories — all categories
export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return NextResponse.json(categories);
}

// POST /api/admin/categories — create category
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { slug, title, tagline, iconType, href, sortOrder } = body;

  if (!slug || !title) {
    return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: { slug, title, tagline: tagline || "", iconType: iconType || "ring", href, sortOrder: sortOrder ?? 0 },
    });

    await cache.invalidate("categories:*");

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/admin/categories — update category
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, title, tagline, iconType, href, sortOrder } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(tagline !== undefined && { tagline }),
      ...(iconType !== undefined && { iconType }),
      ...(href !== undefined && { href }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });

  await cache.invalidate("categories:*");

  return NextResponse.json(category);
}

// DELETE /api/admin/categories
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Check if category has products
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json({ error: `Cannot delete: ${productCount} products still in this category` }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  await cache.invalidate("categories:*");

  return NextResponse.json({ success: true });
}
