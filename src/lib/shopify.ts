/**
 * lib/shopify.ts
 * Shopify Admin API client — used by admin panel routes for CRUD operations.
 * Uses raw GraphQL fetch (no SDK dependency needed).
 */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-04";

const ADMIN_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

// ─── Generic GraphQL helper ───────────────────────────────────

export async function shopifyAdmin<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(ADMIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin API error (${res.status}): ${text}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(`Shopify GQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

// ─── ID helpers ──────────────────────────────────────────────

/** Extract numeric ID from Shopify GID. e.g. "gid://shopify/Product/123" → "123" */
export function extractId(gid: string): string {
  return gid.split("/").pop() || gid;
}

/** Build a Shopify GID from a numeric ID */
export function toGid(resource: string, id: string): string {
  if (id.startsWith("gid://")) return id;
  return `gid://shopify/${resource}/${id}`;
}

// ─── Metafield helpers ───────────────────────────────────────

const NAMESPACE = "jewel_avenue";

interface MetafieldInput {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

function buildMetafields(fields: Record<string, string | number | boolean | null | undefined>): MetafieldInput[] {
  const metas: MetafieldInput[] = [];
  for (const [key, val] of Object.entries(fields)) {
    if (val === undefined || val === null) continue;
    const type = typeof val === "boolean" ? "boolean" : typeof val === "number" ? "number_integer" : "single_line_text_field";
    metas.push({
      namespace: NAMESPACE,
      key,
      value: String(val),
      type,
    });
  }
  return metas;
}

function getMetafield(metafields: Array<{ namespace: string; key: string; value: string }>, key: string): string | null {
  return metafields?.find((m) => m.namespace === NAMESPACE && m.key === key)?.value ?? null;
}

// ─── PRODUCTS ────────────────────────────────────────────────

const PRODUCT_FIELDS = `
  id
  title
  descriptionHtml
  handle
  status
  tags
  images(first: 20) {
    edges {
      node {
        id
        url
        altText
      }
    }
  }
  variants(first: 5) {
    edges {
      node {
        id
        price
        inventoryQuantity
      }
    }
  }
  collections(first: 5) {
    edges {
      node {
        id
        title
        handle
      }
    }
  }
  metafields(first: 30, namespace: "${NAMESPACE}") {
    edges {
      node {
        namespace
        key
        value
      }
    }
  }
`;

/** Shape returned by our normalise function — matches what the admin frontend expects */
export interface NormalisedProduct {
  id: string;
  name: string;
  price: number;
  displayPrice: string;
  subtitle: string | null;
  description: string | null;
  styleCode: string;
  goldWeight: string | null;
  netWeight: string | null;
  diamondCount: string | null;
  diamondWeight: string | null;
  purity: string | null;
  bestseller: boolean;
  stock: number;
  isActive: boolean;
  sortOrder: number;
  customAttributes: unknown;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; slug: string; title: string } | null;
  images: Array<{ id: string; url: string; sortOrder: number; isHover: boolean }>;
  customizations: Array<{ id: string; type: string; value: string }>;
  _count: { orderItems: number };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseProduct(node: any): NormalisedProduct {
  const metafields = node.metafields?.edges?.map((e: { node: unknown }) => e.node) || [];
  const images = node.images?.edges?.map((e: { node: { id: string; url: string; altText: string | null } }, i: number) => ({
    id: extractId(e.node.id),
    url: e.node.url,
    sortOrder: i,
    isHover: e.node.altText === "hover",
  })) || [];
  const variant = node.variants?.edges?.[0]?.node;
  const collection = node.collections?.edges?.[0]?.node;
  const customizationsRaw = getMetafield(metafields, "customizations");
  let customizations: Array<{ id: string; type: string; value: string }> = [];
  if (customizationsRaw) {
    try { customizations = JSON.parse(customizationsRaw); } catch { /* ignore */ }
  }

  return {
    id: extractId(node.id),
    name: node.title,
    price: variant ? Math.round(parseFloat(variant.price) * 100) : 0,
    displayPrice: getMetafield(metafields, "displayPrice") || (variant ? `₹${parseFloat(variant.price).toLocaleString("en-IN")}` : "₹0"),
    subtitle: getMetafield(metafields, "subtitle"),
    description: node.descriptionHtml || null,
    styleCode: getMetafield(metafields, "styleCode") || node.handle || "",
    goldWeight: getMetafield(metafields, "goldWeight"),
    netWeight: getMetafield(metafields, "netWeight"),
    diamondCount: getMetafield(metafields, "diamondCount"),
    diamondWeight: getMetafield(metafields, "diamondWeight"),
    purity: getMetafield(metafields, "purity"),
    bestseller: node.tags?.includes("bestseller") || false,
    stock: variant?.inventoryQuantity ?? 100,
    isActive: node.status === "ACTIVE",
    sortOrder: parseInt(getMetafield(metafields, "sortOrder") || "0"),
    customAttributes: null,
    categoryId: collection ? extractId(collection.id) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: collection
      ? { id: extractId(collection.id), slug: collection.handle, title: collection.title }
      : null,
    images,
    customizations,
    _count: { orderItems: 0 },
  };
}

/** List products with pagination + search */
export async function listProducts(opts: {
  page?: number;
  limit?: number;
  search?: string;
  collectionId?: string;
  bestseller?: boolean;
}): Promise<{ products: NormalisedProduct[]; total: number; page: number; limit: number; totalPages: number }> {
  const { page = 1, limit = 20, search, collectionId, bestseller } = opts;

  // Build query filter
  const queryParts: string[] = [];
  if (search) queryParts.push(`title:*${search}* OR tag:*${search}*`);
  if (collectionId) queryParts.push(`collection_id:${collectionId}`);
  if (bestseller) queryParts.push(`tag:bestseller`);

  const queryFilter = queryParts.length > 0 ? queryParts.join(" AND ") : "";

  // Shopify uses cursor pagination; we simulate page-based with `first` + offset
  // For simplicity we fetch all up to limit and use reverse to get "pages"
  const data = await shopifyAdmin<{
    products: {
      edges: Array<{ node: unknown; cursor: string }>;
      pageInfo: { hasNextPage: boolean };
    };
    productsCount: { count: number };
  }>(`
    query ListProducts($first: Int!, $query: String) {
      products(first: $first, query: $query, sortKey: TITLE) {
        edges {
          node { ${PRODUCT_FIELDS} }
          cursor
        }
        pageInfo { hasNextPage }
      }
      productsCount(query: $query) { count }
    }
  `, {
    first: limit,
    query: queryFilter || null,
  });

  const total = data.productsCount?.count ?? data.products.edges.length;

  return {
    products: data.products.edges.map((e) => normaliseProduct(e.node)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** Get single product by Shopify numeric ID */

export async function getProduct(id: string): Promise<NormalisedProduct | null> {
  const gid = toGid("Product", id);
  const data = await shopifyAdmin<{ product: unknown | null }>(`
    query GetProduct($id: ID!) {
      product(id: $id) { ${PRODUCT_FIELDS} }
    }
  `, { id: gid });

  return data.product ? normaliseProduct(data.product) : null;
}

/** Create a product */
export async function createProduct(input: {
  name: string;
  price: number;
  displayPrice: string;
  subtitle?: string;
  description?: string;
  styleCode?: string;
  goldWeight?: string;
  netWeight?: string;
  diamondCount?: string;
  diamondWeight?: string;
  purity?: string;
  bestseller?: boolean;
  stock?: number;
  isActive?: boolean;
  categoryId?: string;
  sortOrder?: number;
  images?: Array<{ url: string; isHover?: boolean }>;
  customizations?: Array<{ type: string; value: string }>;
}): Promise<NormalisedProduct> {
  const tags: string[] = [];
  if (input.bestseller) tags.push("bestseller");

  const metafields = buildMetafields({
    displayPrice: input.displayPrice,
    subtitle: input.subtitle,
    styleCode: input.styleCode,
    goldWeight: input.goldWeight,
    netWeight: input.netWeight,
    diamondCount: input.diamondCount,
    diamondWeight: input.diamondWeight,
    purity: input.purity,
    sortOrder: input.sortOrder ?? 0,
  });

  if (input.customizations && input.customizations.length > 0) {
    metafields.push({
      namespace: NAMESPACE,
      key: "customizations",
      value: JSON.stringify(input.customizations.map((c, i) => ({ id: String(i), ...c }))),
      type: "json",
    });
  }

  const productInput: Record<string, unknown> = {
    title: input.name,
    descriptionHtml: input.description || "",
    tags,
    status: input.isActive === false ? "DRAFT" : "ACTIVE",
    metafields,
  };

  // Add to collection if categoryId provided
  if (input.categoryId) {
    productInput.collectionsToJoin = [toGid("Collection", input.categoryId)];
  }

  const data = await shopifyAdmin<{
    productCreate: {
      product: unknown;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(`
    mutation ProductCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product { ${PRODUCT_FIELDS} }
        userErrors { field message }
      }
    }
  `, { input: productInput });

  if (data.productCreate.userErrors.length > 0) {
    throw new Error(data.productCreate.userErrors.map((e) => e.message).join(", "));
  }

  const product = normaliseProduct(data.productCreate.product);

  // Set variant price and inventory after creation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createdProduct = data.productCreate.product as any;
  const variantId = createdProduct?.variants?.edges?.[0]?.node?.id;
  if (variantId) {
    await shopifyAdmin(`
      mutation VariantUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants { id }
          userErrors { field message }
        }
      }
    `, {
      productId: createdProduct.id,
      variants: [{ id: variantId, price: (input.price / 100).toFixed(2) }],
    });
  }

  // Upload images if provided
  if (input.images && input.images.length > 0) {
    for (const img of input.images) {
      await shopifyAdmin(`
        mutation CreateMediaForProduct($productId: ID!, $media: [CreateMediaInput!]!) {
          productCreateMedia(productId: $productId, media: $media) {
            media { ... on MediaImage { id image { url altText } } }
            mediaUserErrors { field message }
          }
        }
      `, {
        productId: createdProduct.id,
        media: [{
          originalSource: img.url,
          alt: img.isHover ? "hover" : "",
          mediaContentType: "IMAGE",
        }],
      });
    }
  }

  return product;
}

/** Update a product */
export async function updateProduct(id: string, input: {
  name?: string;
  price?: number;
  displayPrice?: string;
  subtitle?: string;
  description?: string;
  goldWeight?: string;
  netWeight?: string;
  diamondCount?: string;
  diamondWeight?: string;
  purity?: string;
  bestseller?: boolean;
  stock?: number;
  isActive?: boolean;
  categoryId?: string;
  sortOrder?: number;
  images?: Array<{ url: string; isHover?: boolean }>;
  customizations?: Array<{ type: string; value: string }>;
}): Promise<NormalisedProduct> {
  const gid = toGid("Product", id);

  const productInput: Record<string, unknown> = { id: gid };
  if (input.name !== undefined) productInput.title = input.name;
  if (input.description !== undefined) productInput.descriptionHtml = input.description;
  if (input.isActive !== undefined) productInput.status = input.isActive ? "ACTIVE" : "DRAFT";

  // Handle tags (bestseller)
  if (input.bestseller !== undefined) {
    productInput.tags = input.bestseller ? ["bestseller"] : [];
  }

  // Build metafields for updatable fields
  const metafields = buildMetafields({
    ...(input.displayPrice !== undefined && { displayPrice: input.displayPrice }),
    ...(input.subtitle !== undefined && { subtitle: input.subtitle }),
    ...(input.goldWeight !== undefined && { goldWeight: input.goldWeight }),
    ...(input.netWeight !== undefined && { netWeight: input.netWeight }),
    ...(input.diamondCount !== undefined && { diamondCount: input.diamondCount }),
    ...(input.diamondWeight !== undefined && { diamondWeight: input.diamondWeight }),
    ...(input.purity !== undefined && { purity: input.purity }),
    ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
  });

  if (input.customizations !== undefined) {
    metafields.push({
      namespace: NAMESPACE,
      key: "customizations",
      value: JSON.stringify(input.customizations.map((c, i) => ({ id: String(i), ...c }))),
      type: "json",
    });
  }

  if (metafields.length > 0) {
    productInput.metafields = metafields;
  }

  // Handle collection change
  if (input.categoryId !== undefined) {
    productInput.collectionsToJoin = [toGid("Collection", input.categoryId)];
  }

  const data = await shopifyAdmin<{
    productUpdate: {
      product: unknown;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(`
    mutation ProductUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product { ${PRODUCT_FIELDS} }
        userErrors { field message }
      }
    }
  `, { input: productInput });

  if (data.productUpdate.userErrors.length > 0) {
    throw new Error(data.productUpdate.userErrors.map((e) => e.message).join(", "));
  }

  // Update variant price if needed
  if (input.price !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedProduct = data.productUpdate.product as any;
    const variantId = updatedProduct?.variants?.edges?.[0]?.node?.id;
    if (variantId) {
      await shopifyAdmin(`
        mutation VariantUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants { id }
            userErrors { field message }
          }
        }
      `, {
        productId: updatedProduct.id,
        variants: [{ id: variantId, price: (input.price / 100).toFixed(2) }],
      });
    }
  }

  return normaliseProduct(data.productUpdate.product);
}

/** Archive (soft-delete) a product */
export async function archiveProduct(id: string): Promise<void> {
  const gid = toGid("Product", id);
  await shopifyAdmin(`
    mutation ProductUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id status }
        userErrors { field message }
      }
    }
  `, { input: { id: gid, status: "ARCHIVED" } });
}

// ─── COLLECTIONS (Categories) ────────────────────────────────

const COLLECTION_FIELDS = `
  id
  title
  handle
  descriptionHtml
  image { url }
  productsCount { count }
  metafields(first: 10, namespace: "${NAMESPACE}") {
    edges {
      node { namespace key value }
    }
  }
`;

export interface NormalisedCategory {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  iconType: string;
  href: string | null;
  sortOrder: number;
  _count: { products: number };
  imageUrl: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseCollection(node: any): NormalisedCategory {
  const metafields = node.metafields?.edges?.map((e: { node: unknown }) => e.node) || [];
  return {
    id: extractId(node.id),
    slug: node.handle,
    title: node.title,
    tagline: getMetafield(metafields, "tagline") || node.descriptionHtml || "",
    iconType: getMetafield(metafields, "iconType") || "ring",
    href: getMetafield(metafields, "href") || `/collections/${node.handle}`,
    sortOrder: parseInt(getMetafield(metafields, "sortOrder") || "0"),
    _count: { products: node.productsCount?.count ?? 0 },
    imageUrl: node.image?.url || null,
  };
}

/** List all collections */
export async function listCollections(): Promise<NormalisedCategory[]> {
  const data = await shopifyAdmin<{
    collections: { edges: Array<{ node: unknown }> };
  }>(`
    query ListCollections {
      collections(first: 50, sortKey: TITLE) {
        edges {
          node { ${COLLECTION_FIELDS} }
        }
      }
    }
  `);

  return data.collections.edges.map((e) => normaliseCollection(e.node));
}

/** Create a collection */
export async function createCollection(input: {
  slug: string;
  title: string;
  tagline: string;
  iconType: string;
  href?: string;
  sortOrder?: number;
  imageUrl?: string;
}): Promise<NormalisedCategory> {
  const data = await shopifyAdmin<{
    collectionCreate: {
      collection: unknown;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(`
    mutation CollectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { ${COLLECTION_FIELDS} }
        userErrors { field message }
      }
    }
  `, {
    input: {
      title: input.title,
      handle: input.slug,
      descriptionHtml: input.tagline,
      image: input.imageUrl ? { src: input.imageUrl } : null,
      metafields: buildMetafields({
        tagline: input.tagline,
        iconType: input.iconType,
        href: input.href || `/collections/${input.slug}`,
        sortOrder: input.sortOrder ?? 0,
      }),
    },
  });

  if (data.collectionCreate.userErrors.length > 0) {
    throw new Error(data.collectionCreate.userErrors.map((e) => e.message).join(", "));
  }

  return normaliseCollection(data.collectionCreate.collection);
}

/** Update a collection */
export async function updateCollection(id: string, input: {
  title?: string;
  tagline?: string;
  iconType?: string;
  href?: string;
  sortOrder?: number;
  imageUrl?: string;
}): Promise<NormalisedCategory> {
  const gid = toGid("Collection", id);
  const collectionInput: Record<string, unknown> = { id: gid };
  if (input.title) collectionInput.title = input.title;
  if (input.tagline) collectionInput.descriptionHtml = input.tagline;
  if (input.imageUrl !== undefined) {
    collectionInput.image = input.imageUrl ? { src: input.imageUrl } : null;
  }

  const metafields = buildMetafields({
    ...(input.tagline !== undefined && { tagline: input.tagline }),
    ...(input.iconType !== undefined && { iconType: input.iconType }),
    ...(input.href !== undefined && { href: input.href }),
    ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
  });
  if (metafields.length > 0) collectionInput.metafields = metafields;

  const data = await shopifyAdmin<{
    collectionUpdate: {
      collection: unknown;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(`
    mutation CollectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { ${COLLECTION_FIELDS} }
        userErrors { field message }
      }
    }
  `, { input: collectionInput });

  if (data.collectionUpdate.userErrors.length > 0) {
    throw new Error(data.collectionUpdate.userErrors.map((e) => e.message).join(", "));
  }

  return normaliseCollection(data.collectionUpdate.collection);
}

/** Delete a collection */
export async function deleteCollection(id: string): Promise<void> {
  const gid = toGid("Collection", id);
  await shopifyAdmin(`
    mutation CollectionDelete($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) {
        deletedCollectionId
        userErrors { field message }
      }
    }
  `, { input: { id: gid } });
}

/** Get a collection by handle with its products (Admin API — no publication needed) */
export async function getCollectionByHandle(handle: string): Promise<{
  collection: NormalisedCategory | null;
  products: NormalisedProduct[];
}> {
  const data = await shopifyAdmin<{
    collectionByHandle: {
      id: string;
      title: string;
      handle: string;
      descriptionHtml: string;
      productsCount: { count: number };
      metafields: { edges: Array<{ node: { namespace: string; key: string; value: string } }> };
      products: { edges: Array<{ node: unknown }> };
    } | null;
  }>(`
    query GetCollectionByHandle($handle: String!) {
      collectionByHandle(handle: $handle) {
        ${COLLECTION_FIELDS}
        products(first: 100) {
          edges {
            node { ${PRODUCT_FIELDS} }
          }
        }
      }
    }
  `, { handle });

  if (!data.collectionByHandle) {
    return { collection: null, products: [] };
  }

  return {
    collection: normaliseCollection(data.collectionByHandle),
    products: data.collectionByHandle.products.edges.map((e) => normaliseProduct(e.node)),
  };
}

// ─── ORDERS ──────────────────────────────────────────────────


export interface NormalisedOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string } | null;
  shippingName: string | null;
  shippingEmail: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    variant: string | null;
    product: { name: string; images: Array<{ url: string }> };
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseOrder(node: any): NormalisedOrder {
  const lineItems = node.lineItems?.edges?.map((e: { node: Record<string, unknown> }) => e.node) || [];
  const shippingAddress = node.shippingAddress;

  return {
    id: extractId(node.id),
    orderNumber: node.name || `#${extractId(node.id)}`,
    status: mapOrderStatus(node.displayFulfillmentStatus, node.displayFinancialStatus),
    totalAmount: Math.round(parseFloat(node.totalPriceSet?.shopMoney?.amount || "0") * 100),
    taxAmount: Math.round(parseFloat(node.totalTaxSet?.shopMoney?.amount || "0") * 100),
    createdAt: node.createdAt,
    updatedAt: node.updatedAt || node.createdAt,
    user: node.customer
      ? { name: `${node.customer.firstName || ""} ${node.customer.lastName || ""}`.trim(), email: node.customer.email || "" }
      : null,
    shippingName: shippingAddress ? `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim() : null,
    shippingEmail: node.email || null,
    shippingPhone: shippingAddress?.phone || null,
    shippingAddress: shippingAddress ? `${shippingAddress.address1 || ""} ${shippingAddress.address2 || ""}`.trim() : null,
    shippingCity: shippingAddress?.city || null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: lineItems.map((li: any) => ({
      id: extractId(li.id),
      productId: li.product ? extractId(li.product.id) : "",
      quantity: li.quantity,
      unitPrice: Math.round(parseFloat(li.originalUnitPriceSet?.shopMoney?.amount || "0") * 100),
      variant: li.variantTitle || null,
      product: {
        name: li.title || "",
        images: li.image ? [{ url: li.image.url }] : [],
      },
    })),
  };
}

function mapOrderStatus(fulfillment: string, financial: string): string {
  if (financial === "REFUNDED") return "REFUNDED";
  if (fulfillment === "FULFILLED") return "DELIVERED";
  if (fulfillment === "IN_PROGRESS") return "SHIPPED";
  if (financial === "PAID") return "CONFIRMED";
  if (financial === "PENDING") return "PENDING";
  return "PROCESSING";
}

/** List orders */
export async function listOrders(): Promise<NormalisedOrder[]> {
  const data = await shopifyAdmin<{
    orders: { edges: Array<{ node: unknown }> };
  }>(`
    query ListOrders {
      orders(first: 50, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            email
            createdAt
            updatedAt
            displayFulfillmentStatus
            displayFinancialStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            totalTaxSet { shopMoney { amount currencyCode } }
            customer {
              firstName
              lastName
              email
            }
            shippingAddress {
              firstName
              lastName
              phone
              address1
              address2
              city
              province
              zip
              country
            }
            lineItems(first: 20) {
              edges {
                node {
                  id
                  title
                  quantity
                  variantTitle
                  originalUnitPriceSet { shopMoney { amount } }
                  product { id }
                  image { url }
                }
              }
            }
          }
        }
      }
    }
  `);

  return data.orders.edges.map((e) => normaliseOrder(e.node));
}

// ─── STATS ───────────────────────────────────────────────────

export async function getDashboardStats() {
  const data = await shopifyAdmin<{
    productsCount: { count: number };
    collectionsCount: { count: number };
    ordersCount: { count: number };
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          totalPriceSet: { shopMoney: { amount: string } };
          displayFulfillmentStatus: string;
          displayFinancialStatus: string;
          createdAt: string;
          customer: { firstName: string; lastName: string; email: string } | null;
        };
      }>;
    };
  }>(`
    query DashboardStats {
      productsCount(query: "status:ACTIVE") { count }
      collectionsCount { count }
      ordersCount { count }
      orders(first: 10, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            totalPriceSet { shopMoney { amount } }
            displayFulfillmentStatus
            displayFinancialStatus
            createdAt
            customer { firstName lastName email }
          }
        }
      }
    }
  `);

  // Calculate total revenue from all non-cancelled orders
  const revenueData = await shopifyAdmin<{
    orders: { edges: Array<{ node: { totalPriceSet: { shopMoney: { amount: string } } } }> };
  }>(`
    query TotalRevenue {
      orders(first: 250, query: "financial_status:paid") {
        edges {
          node {
            totalPriceSet { shopMoney { amount } }
          }
        }
      }
    }
  `);

  const totalRevenue = revenueData.orders.edges.reduce(
    (sum, e) => sum + Math.round(parseFloat(e.node.totalPriceSet.shopMoney.amount) * 100),
    0
  );

  return {
    totalProducts: data.productsCount.count,
    totalCategories: data.collectionsCount.count,
    totalOrders: data.ordersCount.count,
    totalUsers: 0, // Users are in Supabase, fetched separately
    totalRevenue,
    recentOrders: data.orders.edges.map((e) => ({
      id: extractId(e.node.id),
      orderNumber: e.node.name,
      totalAmount: Math.round(parseFloat(e.node.totalPriceSet.shopMoney.amount) * 100),
      status: mapOrderStatus(e.node.displayFulfillmentStatus, e.node.displayFinancialStatus),
      createdAt: e.node.createdAt,
      user: e.node.customer
        ? { name: `${e.node.customer.firstName || ""} ${e.node.customer.lastName || ""}`.trim(), email: e.node.customer.email }
        : null,
    })),
  };
}

// ── STORE SETTINGS (Metafields on Shop level) ─────────────────

export interface StoreSettings {
  heroVideoUrl: string;
  giftingTitle: string;
  giftingTagline: string;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const data = await shopifyAdmin<{
    shop: {
      heroVideoUrl: { value: string } | null;
      giftingTitle: { value: string } | null;
      giftingTagline: { value: string } | null;
    };
  }>(`
    query GetStoreSettings {
      shop {
        heroVideoUrl: metafield(namespace: "jewel_avenue", key: "hero_video_url") { value }
        giftingTitle: metafield(namespace: "jewel_avenue", key: "gifting_title") { value }
        giftingTagline: metafield(namespace: "jewel_avenue", key: "gifting_tagline") { value }
      }
    }
  `);

  return {
    heroVideoUrl: data.shop.heroVideoUrl?.value || "/HomeIntro.mp4",
    giftingTitle: data.shop.giftingTitle?.value || "Unforgettable Gifting",
    giftingTagline: data.shop.giftingTagline?.value || "Wrap your love in our iconic green boxes.",
  };
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  const shopData = await shopifyAdmin<{ shop: { id: string } }>(`
    query GetShopId {
      shop { id }
    }
  `);

  const shopId = shopData.shop.id;
  const metafields: Array<{ ownerId: string; namespace: string; key: string; value: string; type: string }> = [];

  if (settings.heroVideoUrl !== undefined) {
    metafields.push({
      ownerId: shopId,
      namespace: "jewel_avenue",
      key: "hero_video_url",
      value: settings.heroVideoUrl,
      type: "single_line_text_field",
    });
  }
  if (settings.giftingTitle !== undefined) {
    metafields.push({
      ownerId: shopId,
      namespace: "jewel_avenue",
      key: "gifting_title",
      value: settings.giftingTitle,
      type: "single_line_text_field",
    });
  }
  if (settings.giftingTagline !== undefined) {
    metafields.push({
      ownerId: shopId,
      namespace: "jewel_avenue",
      key: "gifting_tagline",
      value: settings.giftingTagline,
      type: "single_line_text_field",
    });
  }

  if (metafields.length === 0) return;

  const res = await shopifyAdmin<{
    metafieldsSet: {
      metafields: Array<{ id: string }>;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(`
    mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }
  `, { metafields });

  if (res.metafieldsSet.userErrors.length > 0) {
    throw new Error(res.metafieldsSet.userErrors.map(e => e.message).join(", "));
  }
}

