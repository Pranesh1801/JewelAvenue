const FALLBACK_IMAGE = "/placeholder.svg";

type ImageLike = {
  carousel?: string[];
  image?: string;
  imageUrl?: string;
  hoverImage?: string;
  thumbnail?: string;
};

function normalizeSrc(src?: string | null): string | undefined {
  if (!src || typeof src !== "string") return undefined;
  const value = src.trim();
  return value.length > 0 ? value : undefined;
}

function getFirstValidSrc(candidates?: Array<string | undefined | null>): string | undefined {
  return candidates?.map(normalizeSrc).find((value): value is string => !!value);
}

/**
 * Safely resolves a product image from multiple possible sources.
 * Fallback order: carousel[0] -> image -> imageUrl -> hoverImage -> thumbnail -> fallback
 * 
 * @param product - Product-like object
 * @returns Valid image URL string
 */
export function getProductImage(product: ImageLike | undefined | null): string {
  if (!product) return FALLBACK_IMAGE;

  return (
    getFirstValidSrc(product.carousel) ||
    normalizeSrc(product.image) ||
    normalizeSrc(product.imageUrl) ||
    normalizeSrc(product.hoverImage) ||
    normalizeSrc(product.thumbnail) ||
    FALLBACK_IMAGE
  );
}

/**
 * Gets hover/secondary image for card hover states
 */
export function getProductHoverImage(product: ImageLike | undefined | null): string {
  if (!product) return FALLBACK_IMAGE;

  return (
    normalizeSrc(product.hoverImage) ||
    (product.carousel && product.carousel.length > 1 ? normalizeSrc(product.carousel[1]) : undefined) ||
    normalizeSrc(product.image) ||
    normalizeSrc(product.imageUrl) ||
    FALLBACK_IMAGE
  );
}
