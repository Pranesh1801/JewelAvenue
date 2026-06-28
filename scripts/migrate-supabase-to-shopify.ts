/**
 * scripts/migrate-supabase-to-shopify.ts
 * Exports ALL existing products & categories from Supabase/Prisma
 * and creates them in Shopify via Admin API.
 * 
 * Run with: npx tsx scripts/migrate-supabase-to-shopify.ts
 */

import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STORE = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const VERSION = process.env.SHOPIFY_API_VERSION || "2026-04";
const URL = `https://${STORE}/admin/api/${VERSION}/graphql.json`;
const REST_URL = `https://${STORE}/admin/api/${VERSION}`;
const NAMESPACE = "jewel_avenue";

async function adminGql(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

// Publish a resource to the storefront using REST API
async function publishProductRest(numericId: string) {
  try {
    await fetch(`${REST_URL}/products/${numericId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": TOKEN,
      },
      body: JSON.stringify({ product: { id: parseInt(numericId), published: true } }),
    });
  } catch { /* ignore */ }
}

async function publishCollectionRest(numericId: string) {
  try {
    await fetch(`${REST_URL}/custom_collections/${numericId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": TOKEN,
      },
      body: JSON.stringify({ custom_collection: { id: parseInt(numericId), published: true } }),
    });
  } catch { /* ignore */ }
}

async function main() {
  console.log("🚀 Supabase → Shopify Migration\n");

  // ─── Step 1: Migrate Categories → Collections ────────────────
  console.log("═══ CATEGORIES ═══");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  console.log(`Found ${categories.length} categories in Supabase\n`);

  // Check which collections already exist in Shopify
  const existingCollections = await adminGql(`
    query { collections(first: 100) { edges { node { id handle title } } } }
  `);
  const existingHandles = new Set(
    existingCollections.collections.edges.map((e: { node: { handle: string } }) => e.node.handle)
  );

  // Map old category ID → new Shopify collection GID
  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    if (existingHandles.has(cat.slug)) {
      // Already exists, get its ID
      const existing = existingCollections.collections.edges.find(
        (e: { node: { handle: string } }) => e.node.handle === cat.slug
      );
      if (existing) {
        categoryMap.set(cat.id, existing.node.id);
        console.log(`  ⏭️  Skip (exists): ${cat.title} → ${existing.node.id}`);
      }
      continue;
    }

    try {
      const data = await adminGql(`
        mutation CreateCollection($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection { id handle title }
            userErrors { field message }
          }
        }
      `, {
        input: {
          title: cat.title,
          handle: cat.slug,
          descriptionHtml: cat.tagline || "",
          metafields: [
            { namespace: NAMESPACE, key: "tagline", value: cat.tagline || "", type: "single_line_text_field" },
            { namespace: NAMESPACE, key: "iconType", value: cat.iconType || "ring", type: "single_line_text_field" },
            { namespace: NAMESPACE, key: "href", value: cat.href || `/collections/${cat.slug}`, type: "single_line_text_field" },
            { namespace: NAMESPACE, key: "sortOrder", value: String(cat.sortOrder), type: "number_integer" },
          ],
        },
      });

      if (data.collectionCreate.userErrors.length > 0) {
        console.error(`  ❌ ${cat.title}: ${data.collectionCreate.userErrors.map((e: { message: string }) => e.message).join(", ")}`);
        continue;
      }

      const collectionId = data.collectionCreate.collection.id;
      categoryMap.set(cat.id, collectionId);
      console.log(`  ✅ Created: ${cat.title} → ${collectionId}`);

      // Publish to storefront
      const collNumId = collectionId.split("/").pop()!;
      await publishCollectionRest(collNumId);
    } catch (err) {
      console.error(`  ❌ ${cat.title}: ${err}`);
    }
  }

  // ─── Step 2: Migrate Products ────────────────────────────────
  console.log("\n═══ PRODUCTS ═══");
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      customizations: true,
    },
    orderBy: { sortOrder: "asc" },
  });
  console.log(`Found ${products.length} products in Supabase\n`);

  // Check which products already exist (by title to avoid duplicates)
  const existingProducts = await adminGql(`
    query { products(first: 250) { edges { node { id title handle } } } }
  `);
  const existingTitles = new Set(
    existingProducts.products.edges.map((e: { node: { title: string } }) => e.node.title.toLowerCase())
  );

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    if (existingTitles.has(product.name.toLowerCase())) {
      console.log(`  ⏭️  Skip (exists): ${product.name}`);
      skipped++;
      continue;
    }

    try {
      // Build tags
      const tags: string[] = [];
      if (product.bestseller) tags.push("bestseller");

      // Build metafields
      const metafields = [
        { namespace: NAMESPACE, key: "displayPrice", value: product.displayPrice, type: "single_line_text_field" },
        { namespace: NAMESPACE, key: "styleCode", value: product.styleCode || "", type: "single_line_text_field" },
        { namespace: NAMESPACE, key: "sortOrder", value: String(product.sortOrder), type: "number_integer" },
      ];

      if (product.subtitle) metafields.push({ namespace: NAMESPACE, key: "subtitle", value: product.subtitle, type: "single_line_text_field" });
      if (product.goldWeight) metafields.push({ namespace: NAMESPACE, key: "goldWeight", value: product.goldWeight, type: "single_line_text_field" });
      if (product.netWeight) metafields.push({ namespace: NAMESPACE, key: "netWeight", value: product.netWeight, type: "single_line_text_field" });
      if (product.diamondCount) metafields.push({ namespace: NAMESPACE, key: "diamondCount", value: product.diamondCount, type: "single_line_text_field" });
      if (product.diamondWeight) metafields.push({ namespace: NAMESPACE, key: "diamondWeight", value: product.diamondWeight, type: "single_line_text_field" });
      if (product.purity) metafields.push({ namespace: NAMESPACE, key: "purity", value: product.purity, type: "single_line_text_field" });

      // Customizations as JSON metafield
      if (product.customizations.length > 0) {
        const customData = product.customizations.map((c, i) => ({
          id: String(i),
          type: c.type,
          value: c.value,
        }));
        metafields.push({ namespace: NAMESPACE, key: "customizations", value: JSON.stringify(customData), type: "json" });
      }

      // Build product input
      const productInput: Record<string, unknown> = {
        title: product.name,
        descriptionHtml: product.description || "",
        tags,
        status: product.isActive ? "ACTIVE" : "DRAFT",
        metafields,
      };

      // Add to collection
      const collectionGid = categoryMap.get(product.categoryId);
      if (collectionGid) {
        productInput.collectionsToJoin = [collectionGid];
      }

      // Create the product
      const data = await adminGql(`
        mutation CreateProduct($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              variants(first: 1) { edges { node { id } } }
            }
            userErrors { field message }
          }
        }
      `, { input: productInput });

      if (data.productCreate.userErrors.length > 0) {
        console.error(`  ❌ ${product.name}: ${data.productCreate.userErrors.map((e: { message: string }) => e.message).join(", ")}`);
        continue;
      }

      const shopifyProduct = data.productCreate.product;
      const variantId = shopifyProduct.variants.edges[0]?.node?.id;

      // Set variant price
      if (variantId) {
        const priceInRupees = (product.price / 100).toFixed(2);
        try {
          await adminGql(`
            mutation SetPrice($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
              productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                productVariants { id }
                userErrors { field message }
              }
            }
          `, {
            productId: shopifyProduct.id,
            variants: [{ id: variantId, price: priceInRupees }],
          });
        } catch (priceErr) {
          console.log(`    ⚠️  Price set failed: ${priceErr}`);
        }
      }

      // Add images
      if (product.images.length > 0) {
        for (const img of product.images) {
          try {
            await adminGql(`
              mutation AddImage($productId: ID!, $media: [CreateMediaInput!]!) {
                productCreateMedia(productId: $productId, media: $media) {
                  media { ... on MediaImage { id } }
                  mediaUserErrors { field message }
                }
              }
            `, {
              productId: shopifyProduct.id,
              media: [{
                originalSource: img.url,
                alt: img.isHover ? "hover" : "",
                mediaContentType: "IMAGE",
              }],
            });
          } catch {
            console.log(`    ⚠️  Image failed: ${img.url.slice(0, 60)}...`);
          }
        }
      }

      // Publish to storefront
      const prodNumId = shopifyProduct.id.split("/").pop()!;
      await publishProductRest(prodNumId);

      console.log(`  ✅ Created: ${product.name} (${product.images.length} images, ₹${product.displayPrice})`);
      created++;
    } catch (err) {
      console.error(`  ❌ ${product.name}: ${err}`);
    }
  }

  console.log(`\n═══ SUMMARY ═══`);
  console.log(`Categories: ${categories.length} total, ${categoryMap.size} mapped`);
  console.log(`Products:   ${products.length} total, ${created} created, ${skipped} skipped`);
  console.log(`\n🎉 Migration complete!`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal:", err);
  prisma.$disconnect();
  process.exit(1);
});
