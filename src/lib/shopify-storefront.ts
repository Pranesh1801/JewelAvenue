/**
 * lib/shopify-storefront.ts
 * Shopify Storefront API client — used by customer-facing routes.
 * Cart operations use cartId stored in cookies.
 */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-04";

const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// ─── Generic GraphQL helper ───────────────────────────────────

export async function shopifyStorefront<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Storefront API error (${res.status}): ${text}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(`Shopify Storefront GQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

// ─── ID helpers ──────────────────────────────────────────────

function extractId(gid: string): string {
  return gid.split("/").pop() || gid;
}

// ─── PRODUCTS (for customer-facing pages) ────────────────────

const PRODUCT_CARD_FIELDS = `
  id
  title
  handle
  description
  tags
  images(first: 10) {
    edges {
      node {
        url
        altText
      }
    }
  }
  variants(first: 5) {
    edges {
      node {
        id
        price { amount currencyCode }
        quantityAvailable
      }
    }
  }
  collections(first: 3) {
    edges {
      node {
        id
        title
        handle
      }
    }
  }
  metafields(identifiers: [
    { namespace: "jewel_avenue", key: "displayPrice" },
    { namespace: "jewel_avenue", key: "subtitle" },
    { namespace: "jewel_avenue", key: "styleCode" },
    { namespace: "jewel_avenue", key: "goldWeight" },
    { namespace: "jewel_avenue", key: "netWeight" },
    { namespace: "jewel_avenue", key: "diamondCount" },
    { namespace: "jewel_avenue", key: "diamondWeight" },
    { namespace: "jewel_avenue", key: "purity" },
    { namespace: "jewel_avenue", key: "sortOrder" },
    { namespace: "jewel_avenue", key: "customizations" }
  ]) {
    key
    value
  }
`;

export interface StorefrontProduct {
  id: string;
  name: string;
  price: number;
  displayPrice: string;
  subtitle: string;
  description: string;
  styleCode: string;
  goldWeight: string;
  netWeight: string;
  diamondCount: string;
  diamondWeight: string;
  purity: string;
  bestseller: boolean;
  stock: number;
  category: string | undefined;
  image: string;
  hoverImage: string;
  carousel: string[];
  customizations: {
    metal: string[];
    size: string[];
    finish: string[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMetaValue(metafields: any[], key: string): string | null {
  if (!metafields) return null;
  return metafields.filter(Boolean).find((m: { key: string }) => m.key === key)?.value ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseStorefrontProduct(node: any): StorefrontProduct {
  const images = node.images?.edges?.map((e: { node: { url: string; altText: string | null } }) => e.node) || [];
  const variant = node.variants?.edges?.[0]?.node;
  const collection = node.collections?.edges?.[0]?.node;
  const metafields = (node.metafields || []).filter(Boolean);

  const mainImage = images[0]?.url || "/placeholder.svg";
  const hoverImage = images.find((img: { altText: string | null }) => img.altText === "hover")?.url || images[0]?.url || "/placeholder.svg";

  // Parse customizations from metafield
  let customizations = { metal: [] as string[], size: [] as string[], finish: [] as string[] };
  const customizationsRaw = getMetaValue(metafields, "customizations");
  if (customizationsRaw) {
    try {
      const parsed: Array<{ type: string; value: string }> = JSON.parse(customizationsRaw);
      customizations = {
        metal: parsed.filter((c) => c.type === "metal").map((c) => c.value),
        size: parsed.filter((c) => c.type === "size").map((c) => c.value),
        finish: parsed.filter((c) => c.type === "finish").map((c) => c.value),
      };
    } catch { /* ignore */ }
  }

  return {
    id: extractId(node.id),
    name: node.title,
    price: variant ? Math.round(parseFloat(variant.price.amount) * 100) : 0,
    displayPrice: getMetaValue(metafields, "displayPrice") || (variant ? `₹${parseFloat(variant.price.amount).toLocaleString("en-IN")}` : "₹0"),
    subtitle: getMetaValue(metafields, "subtitle") || "",
    description: node.description || "",
    styleCode: getMetaValue(metafields, "styleCode") || node.handle || "",
    goldWeight: getMetaValue(metafields, "goldWeight") || "",
    netWeight: getMetaValue(metafields, "netWeight") || "",
    diamondCount: getMetaValue(metafields, "diamondCount") || "",
    diamondWeight: getMetaValue(metafields, "diamondWeight") || "",
    purity: getMetaValue(metafields, "purity") || "",
    bestseller: node.tags?.includes("bestseller") || false,
    stock: variant?.quantityAvailable ?? 100,
    category: collection?.title || undefined,
    image: mainImage,
    hoverImage,
    carousel: images.map((img: { url: string }) => img.url),
    customizations,
  };
}

/** List products with filters */
export async function sfListProducts(opts: {
  category?: string;
  bestseller?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: StorefrontProduct[]; total: number; page: number; limit: number; totalPages: number }> {
  const { category, bestseller, search, sort, page = 1, limit = 20 } = opts;

  // If we need products from a specific collection
  if (category) {
    return sfListProductsByCollection(category, { search, bestseller, sort, page, limit });
  }

  // Build query filters
  const queryParts: string[] = [];
  if (bestseller) queryParts.push("tag:bestseller");
  if (search) queryParts.push(`title:*${search}*`);
  const queryFilter = queryParts.length > 0 ? queryParts.join(" AND ") : null;

  // Determine sort key
  let sortKey = "TITLE";
  let reverse = false;
  if (sort) {
    const [field, dir] = sort.split("_");
    if (field === "price") { sortKey = "PRICE"; reverse = dir === "desc"; }
    else if (field === "createdAt") { sortKey = "CREATED_AT"; reverse = dir === "desc"; }
    else if (field === "name") { sortKey = "TITLE"; reverse = dir === "desc"; }
  }

  const data = await shopifyStorefront<{
    products: {
      edges: Array<{ node: unknown }>;
      pageInfo: { hasNextPage: boolean };
    };
  }>(`
    query ListProducts($first: Int!, $query: String, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
      products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node { ${PRODUCT_CARD_FIELDS} }
        }
        pageInfo { hasNextPage }
      }
    }
  `, {
    first: limit,
    query: queryFilter,
    sortKey,
    reverse,
  });

  const products = data.products.edges.map((e) => normaliseStorefrontProduct(e.node));
  const total = products.length + (data.products.pageInfo.hasNextPage ? limit : 0);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** List products within a specific collection (by handle/slug) */
async function sfListProductsByCollection(
  slug: string,
  opts: { search?: string; bestseller?: boolean; sort?: string; page?: number; limit?: number }
): Promise<{ products: StorefrontProduct[]; total: number; page: number; limit: number; totalPages: number }> {
  const { limit = 20, page = 1 } = opts;

  const data = await shopifyStorefront<{
    collection: {
      id: string;
      title: string;
      products: {
        edges: Array<{ node: unknown }>;
        pageInfo: { hasNextPage: boolean };
      };
    } | null;
  }>(`
    query CollectionProducts($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        title
        products(first: $first) {
          edges {
            node { ${PRODUCT_CARD_FIELDS} }
          }
          pageInfo { hasNextPage }
        }
      }
    }
  `, { handle: slug, first: limit });

  if (!data.collection) {
    return { products: [], total: 0, page, limit, totalPages: 0 };
  }

  let products = data.collection.products.edges.map((e) => normaliseStorefrontProduct(e.node));

  // Client-side filters (Storefront API has limited filter support within collections)
  if (opts.bestseller) products = products.filter((p) => p.bestseller);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  const total = products.length;
  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Get single product by ID */
export async function sfGetProduct(id: string): Promise<StorefrontProduct | null> {
  // Try by ID first, then by handle
  const gid = id.startsWith("gid://") ? id : `gid://shopify/Product/${id}`;

  const data = await shopifyStorefront<{ product: unknown | null }>(`
    query GetProduct($id: ID!) {
      product(id: $id) { ${PRODUCT_CARD_FIELDS} }
    }
  `, { id: gid });

  if (!data.product) {
    // Try by handle
    const handleData = await shopifyStorefront<{ product: unknown | null }>(`
      query GetProductByHandle($handle: String!) {
        product(handle: $handle) { ${PRODUCT_CARD_FIELDS} }
      }
    `, { handle: id });

    return handleData.product ? normaliseStorefrontProduct(handleData.product) : null;
  }

  return normaliseStorefrontProduct(data.product);
}

// ─── COLLECTIONS ─────────────────────────────────────────────

export interface StorefrontCollection {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  iconType: string;
  href: string;
  sortOrder: number;
  productCount: number;
}

/** List all collections */
export async function sfListCollections(): Promise<StorefrontCollection[]> {
  const data = await shopifyStorefront<{
    collections: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          description: string;
          metafields: Array<{ key: string; value: string }> | null;
        };
      }>;
    };
  }>(`
    query ListCollections {
      collections(first: 50, sortKey: TITLE) {
        edges {
          node {
            id
            title
            handle
            description
            metafields(identifiers: [
              { namespace: "jewel_avenue", key: "tagline" },
              { namespace: "jewel_avenue", key: "iconType" },
              { namespace: "jewel_avenue", key: "href" },
              { namespace: "jewel_avenue", key: "sortOrder" }
            ]) {
              key
              value
            }
          }
        }
      }
    }
  `);

  return data.collections.edges.map((e) => {
    const n = e.node;
    const mf = n.metafields || [];
    return {
      id: extractId(n.id),
      slug: n.handle,
      title: n.title,
      tagline: getMetaValue(mf, "tagline") || n.description || "",
      iconType: getMetaValue(mf, "iconType") || "ring",
      href: getMetaValue(mf, "href") || `/collections/${n.handle}`,
      sortOrder: parseInt(getMetaValue(mf, "sortOrder") || "0"),
      productCount: 0, // Count not available in Storefront API
    };
  });
}

/** Get collection by handle with products */
export async function sfGetCollectionByHandle(handle: string): Promise<{
  collection: { id: string; title: string; tagline: string } | null;
  products: StorefrontProduct[];
}> {
  const data = await shopifyStorefront<{
    collection: {
      id: string;
      title: string;
      description: string;
      metafields: Array<{ key: string; value: string }> | null;
      products: { edges: Array<{ node: unknown }> };
    } | null;
  }>(`
    query CollectionByHandle($handle: String!) {
      collection(handle: $handle) {
        id
        title
        description
        metafields(identifiers: [
          { namespace: "jewel_avenue", key: "tagline" }
        ]) {
          key
          value
        }
        products(first: 100) {
          edges {
            node { ${PRODUCT_CARD_FIELDS} }
          }
        }
      }
    }
  `, { handle });

  if (!data.collection) return { collection: null, products: [] };

  const mf = data.collection.metafields || [];

  return {
    collection: {
      id: extractId(data.collection.id),
      title: data.collection.title,
      tagline: getMetaValue(mf, "tagline") || data.collection.description || "Explore our collection",
    },
    products: data.collection.products.edges.map((e) => normaliseStorefrontProduct(e.node)),
  };
}

// ─── CART ────────────────────────────────────────────────────

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    totalAmount { amount currencyCode }
    subtotalAmount { amount currencyCode }
    totalTaxAmount { amount currencyCode }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            product {
              id
              title
              handle
              images(first: 2) {
                edges {
                  node { url altText }
                }
              }
              collections(first: 1) {
                edges {
                  node { title }
                }
              }
              metafields(identifiers: [
                { namespace: "jewel_avenue", key: "displayPrice" },
                { namespace: "jewel_avenue", key: "purity" }
              ]) {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: string;
  priceValue: number;
  image: string;
  quantity: number;
  variant: string | null;
  category: string | undefined;
  purity: string | null;
  bestseller: boolean;
}

export interface CartData {
  cartId: string;
  checkoutUrl: string;
  totalQuantity: number;
  items: CartItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseCart(cart: any): CartData {
  const lines = cart.lines?.edges?.map((e: { node: unknown }) => e.node) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: CartItem[] = lines.map((line: any) => {
    const product = line.merchandise?.product;
    const images = product?.images?.edges?.map((e: { node: { url: string } }) => e.node) || [];
    const collection = product?.collections?.edges?.[0]?.node;
    const metafields = product?.metafields || [];

    return {
      id: line.id,
      productId: product ? extractId(product.id) : "",
      title: product?.title || "",
      price: getMetaValue(metafields, "displayPrice") || `₹${parseFloat(line.merchandise.price.amount).toLocaleString("en-IN")}`,
      priceValue: Math.round(parseFloat(line.merchandise.price.amount) * 100),
      image: images[0]?.url || "/placeholder.svg",
      quantity: line.quantity,
      variant: line.merchandise.title !== "Default Title" ? line.merchandise.title : null,
      category: collection?.title,
      purity: getMetaValue(metafields, "purity"),
      bestseller: product?.tags?.includes("bestseller") || false,
    };
  });

  return {
    cartId: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    items,
  };
}

/** Create a new cart */
export async function createCart(): Promise<CartData> {
  const data = await shopifyStorefront<{
    cartCreate: { cart: unknown };
  }>(`
    mutation CartCreate {
      cartCreate {
        cart { ${CART_FIELDS} }
      }
    }
  `);

  return normaliseCart(data.cartCreate.cart);
}

/** Get existing cart by ID */
export async function getCart(cartId: string): Promise<CartData | null> {
  const data = await shopifyStorefront<{ cart: unknown | null }>(`
    query GetCart($id: ID!) {
      cart(id: $id) { ${CART_FIELDS} }
    }
  `, { id: cartId });

  return data.cart ? normaliseCart(data.cart) : null;
}

/** Add item to cart */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<CartData> {
  const gid = variantId.startsWith("gid://") ? variantId : `gid://shopify/ProductVariant/${variantId}`;

  const data = await shopifyStorefront<{
    cartLinesAdd: { cart: unknown };
  }>(`
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
      }
    }
  `, {
    cartId,
    lines: [{ merchandiseId: gid, quantity }],
  });

  return normaliseCart(data.cartLinesAdd.cart);
}

/** Update cart line quantity */
export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<CartData> {
  const data = await shopifyStorefront<{
    cartLinesUpdate: { cart: unknown };
  }>(`
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
      }
    }
  `, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  return normaliseCart(data.cartLinesUpdate.cart);
}

/** Remove line from cart */
export async function removeCartLine(
  cartId: string,
  lineId: string
): Promise<CartData> {
  const data = await shopifyStorefront<{
    cartLinesRemove: { cart: unknown };
  }>(`
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FIELDS} }
      }
    }
  `, {
    cartId,
    lineIds: [lineId],
  });

  return normaliseCart(data.cartLinesRemove.cart);
}

/** Get the first variant ID for a product (used when adding to cart by product ID) */
export async function getProductVariantId(productId: string): Promise<string | null> {
  const gid = productId.startsWith("gid://") ? productId : `gid://shopify/Product/${productId}`;

  const data = await shopifyStorefront<{
    product: { variants: { edges: Array<{ node: { id: string } }> } } | null;
  }>(`
    query GetVariant($id: ID!) {
      product(id: $id) {
        variants(first: 1) {
          edges { node { id } }
        }
      }
    }
  `, { id: gid });

  return data.product?.variants?.edges?.[0]?.node?.id || null;
}
