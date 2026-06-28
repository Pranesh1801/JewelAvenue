import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/shopify";

// GET /api/products/:id — single product with full details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await getProduct(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return in the shape the frontend expects
    return NextResponse.json({
      id: product.id,
      name: product.name,
      price: product.price,
      displayPrice: product.displayPrice,
      subtitle: product.subtitle,
      description: product.description,
      styleCode: product.styleCode,
      goldWeight: product.goldWeight,
      netWeight: product.netWeight,
      diamondCount: product.diamondCount,
      diamondWeight: product.diamondWeight,
      purity: product.purity,
      bestseller: product.bestseller,
      stock: product.stock,
      isActive: product.isActive,
      category: product.category ? { title: product.category.title } : { title: "" },
      images: product.images,
      customizations: product.customizations,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/products/:id] Shopify error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
