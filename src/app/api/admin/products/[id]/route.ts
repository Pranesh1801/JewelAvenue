import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cache } from "@/lib/cache";

// GET /api/admin/products/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKETING")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      customizations: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/admin/products/:id — update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const {
    name, price, displayPrice, subtitle, description,
    goldWeight, netWeight, diamondCount, diamondWeight, purity,
    bestseller, stock, isActive, categoryId, images, customizations,
  } = body;

  try {
    // Update product fields
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price }),
        ...(displayPrice !== undefined && { displayPrice }),
        ...(subtitle !== undefined && { subtitle }),
        ...(description !== undefined && { description }),
        ...(goldWeight !== undefined && { goldWeight }),
        ...(netWeight !== undefined && { netWeight }),
        ...(diamondCount !== undefined && { diamondCount }),
        ...(diamondWeight !== undefined && { diamondWeight }),
        ...(purity !== undefined && { purity }),
        ...(bestseller !== undefined && { bestseller }),
        ...(stock !== undefined && { stock }),
        ...(isActive !== undefined && { isActive }),
        ...(categoryId !== undefined && { categoryId }),
      },
    });

    // Replace images if provided
    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: { url: string; isHover?: boolean }, i: number) => ({
            productId: id,
            url: img.url,
            sortOrder: i,
            isHover: img.isHover || false,
          })),
        });
      }
    }

    // Replace customizations if provided
    if (customizations !== undefined) {
      await prisma.productCustomization.deleteMany({ where: { productId: id } });
      if (customizations.length > 0) {
        await prisma.productCustomization.createMany({
          data: customizations.map((c: { type: string; value: string }) => ({
            productId: id,
            type: c.type,
            value: c.value,
          })),
        });
      }
    }

    // Invalidate caches
    await cache.invalidate("products:*");
    await cache.del(`product:${id}`);
    await cache.invalidate("report:*");

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { images: true, customizations: true, category: true },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/products/:id — soft delete (set isActive=false)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  await cache.invalidate("products:*");
  await cache.del(`product:${id}`);

  return NextResponse.json({ success: true });
}
