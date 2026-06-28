import { NextResponse } from "next/server";
import { listCollections } from "@/lib/shopify";

// GET /api/categories — all categories with product counts
export async function GET() {
  try {
    const collections = await listCollections();

    // Map to the shape the frontend expects (HeroGlassCard etc.)
    const result = collections.map((col) => ({
      id: col.id,
      slug: col.slug,
      title: col.title,
      tagline: col.tagline,
      iconType: col.iconType,
      href: col.href,
      sortOrder: col.sortOrder,
      productCount: col._count.products,
      imageUrl: col.imageUrl,
    }));

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/categories] Shopify error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
