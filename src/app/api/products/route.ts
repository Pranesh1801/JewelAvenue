import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/shopify";

// GET /api/products — paginated product list with filters
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const search = searchParams.get("search") || undefined;
  const collectionId = searchParams.get("collectionId") || undefined;
  const bestseller = searchParams.get("bestseller") === "true" ? true : undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  try {
    const result = await listProducts({ search, collectionId, bestseller, page, limit });

    // Map to the shape the frontend expects
    const products = result.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      displayPrice: p.displayPrice,
      subtitle: p.subtitle || "",
      description: p.description || "",
      styleCode: p.styleCode,
      goldWeight: p.goldWeight || "",
      netWeight: p.netWeight || "",
      diamondCount: p.diamondCount || "",
      diamondWeight: p.diamondWeight || "",
      purity: p.purity || "",
      bestseller: p.bestseller,
      stock: p.stock,
      category: p.category?.title,
      image: p.images[0]?.url || "/placeholder.svg",
      hoverImage: p.images.find((img) => img.isHover)?.url || p.images[0]?.url || "/placeholder.svg",
      carousel: p.images.map((img) => img.url),
      images: p.images,
      customizations: p.customizations,
    }));

    return NextResponse.json({
      products,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/products] Shopify error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
