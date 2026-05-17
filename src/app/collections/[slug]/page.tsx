import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { RingsPage } from "@/components/collections/RingsPage";
import { Product } from "@/data/types";

// Fully dynamic — new categories appear immediately without rebuild
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic metadata from database
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { title: true, tagline: true },
  });

  if (!category) {
    return { title: "Collection Not Found — Jewel Avenue" };
  }

  return {
    title: `${category.title} Collection — Jewel Avenue`,
    description: category.tagline || `Explore our ${category.title} collection.`,
  };
}

// Map Prisma product to the frontend Product interface
function mapProduct(p: Record<string, unknown>): Product {
  const images = (p.images as { url: string; isHover: boolean }[]) || [];
  const customizations = (p.customizations as { type: string; value: string }[]) || [];

  return {
    id: p.id as number,
    name: p.name as string,
    price: p.displayPrice as string,
    image: images[0]?.url || "/placeholder.svg",
    hoverImage: images.find((img) => img.isHover)?.url || images[0]?.url || "/placeholder.svg",
    subtitle: (p.subtitle as string) || "",
    description: (p.description as string) || "",
    styleCode: (p.styleCode as string) || "",
    goldWeight: (p.goldWeight as string) || "",
    netWeight: (p.netWeight as string) || "",
    diamondCount: (p.diamondCount as string) || "",
    diamondWeight: (p.diamondWeight as string) || "",
    purity: (p.purity as string) || "",
    bestseller: (p.bestseller as boolean) || false,
    stock: p.stock as number,
    category: ((p.category as { title: string })?.title) || undefined,
    carousel: images.map((img) => img.url),
    customizations: {
      metal: customizations.filter((c) => c.type === "metal").map((c) => c.value),
      size: customizations.filter((c) => c.type === "size").map((c) => c.value),
      finish: customizations.filter((c) => c.type === "finish").map((c) => c.value),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, title: true, tagline: true },
  });

  if (!category) notFound();

  const dbProducts = await prisma.product.findMany({
    where: { categoryId: category.id, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      category: { select: { title: true } },
      images: { orderBy: { sortOrder: "asc" } },
      customizations: true,
    },
  });

  // Convert to plain objects (server → client boundary)
  const products: Product[] = dbProducts.map((p) =>
    mapProduct(p as unknown as Record<string, unknown>)
  );

  return (
    <RingsPage
      products={products}
      title={category.title}
      tagline={category.tagline ?? "Explore our collection"}
    />
  );
}
