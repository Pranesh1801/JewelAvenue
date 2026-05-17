import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cache, CacheKeys, CacheTTL } from "@/lib/cache";

interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  variant: string | null;
  product: {
    name: string;
    price: number;
    displayPrice: string;
    purity: string | null;
    bestseller: boolean;
    images: { url: string }[];
    category: { title: string } | null;
  };
}

// GET /api/cart — get authenticated user's cart
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cacheKey = CacheKeys.userCart(session.user.id);
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          category: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = (items as CartItemWithProduct[]).map((item: CartItemWithProduct) => ({
    id: item.id,
    productId: item.productId,
    title: item.product.name,
    price: item.product.displayPrice,
    priceValue: item.product.price,
    image: item.product.images[0]?.url || "/placeholder.svg",
    quantity: item.quantity,
    variant: item.variant,
    category: item.product.category?.title,
    purity: item.product.purity,
    bestseller: item.product.bestseller,
  }));

  await cache.set(cacheKey, result, CacheTTL.CART);

  return NextResponse.json(result);
}

// POST /api/cart — add item to cart
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, variant } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  // Upsert — increment quantity if same product+variant exists
  const existing = await prisma.cartItem.findFirst({
    where: {
      userId: session.user.id,
      productId,
      variant: variant || null,
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        variant: variant || null,
        quantity: 1,
      },
    });
  }

  // Invalidate cache
  await cache.del(CacheKeys.userCart(session.user.id));

  return NextResponse.json({ success: true });
}

// PATCH /api/cart — update item quantity
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, quantity } = body;

  if (!id || typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.cartItem.updateMany({
    where: { id, userId: session.user.id },
    data: { quantity },
  });

  await cache.del(CacheKeys.userCart(session.user.id));

  return NextResponse.json({ success: true });
}

// DELETE /api/cart — remove item(s)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const clearAll = searchParams.get("clear") === "true";

  if (clearAll) {
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
  } else if (id) {
    await prisma.cartItem.deleteMany({ where: { id, userId: session.user.id } });
  } else {
    return NextResponse.json({ error: "Provide id or clear=true" }, { status: 400 });
  }

  await cache.del(CacheKeys.userCart(session.user.id));

  return NextResponse.json({ success: true });
}
