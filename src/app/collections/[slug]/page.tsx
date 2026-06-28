import { notFound } from "next/navigation";
import { RingsPage } from "@/components/collections/RingsPage";
import { Product } from "@/data/types";
import { getCollectionByHandle, NormalisedProduct } from "@/lib/shopify";

// Fully dynamic — new categories appear immediately without rebuild
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic metadata from Shopify
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { collection } = await getCollectionByHandle(slug);

  if (!collection) {
    return { title: "Collection Not Found — Jewel Avenue" };
  }

  return {
    title: `${collection.title} Collection — Jewel Avenue`,
    description: collection.tagline || `Explore our ${collection.title} collection.`,
  };
}

// Map Shopify Admin product to the frontend Product interface
function mapProduct(p: NormalisedProduct): Product {
  return {
    id: p.id as unknown as number,
    name: p.name,
    price: p.displayPrice,
    image: p.images[0]?.url || "/placeholder.svg",
    hoverImage: p.images.find((img) => img.isHover)?.url || p.images[0]?.url || "/placeholder.svg",
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
    carousel: p.images.map((img) => img.url),
    customizations: {
      metal: p.customizations.filter((c) => c.type === "metal").map((c) => c.value),
      size: p.customizations.filter((c) => c.type === "size").map((c) => c.value),
      finish: p.customizations.filter((c) => c.type === "finish").map((c) => c.value),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const { collection, products: shopifyProducts } = await getCollectionByHandle(slug);

  if (!collection) notFound();

  const products: Product[] = shopifyProducts.map(mapProduct);

  return (
    <RingsPage
      products={products}
      title={collection.title}
      tagline={collection.tagline}
    />
  );
}
