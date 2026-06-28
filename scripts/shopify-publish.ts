/**
 * scripts/shopify-publish.ts
 * Publish all products to the custom app's storefront channel via REST API.
 * Run with: npx tsx scripts/shopify-publish.ts
 */

import { config } from "dotenv";
config();

const STORE = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const VERSION = process.env.SHOPIFY_API_VERSION || "2026-04";
const GQL_URL = `https://${STORE}/admin/api/${VERSION}/graphql.json`;
const REST_URL = `https://${STORE}/admin/api/${VERSION}`;

async function adminGql(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(GQL_URL, {
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

async function restGet(endpoint: string) {
  const res = await fetch(`${REST_URL}${endpoint}`, {
    headers: { "X-Shopify-Access-Token": TOKEN },
  });
  return res.json();
}

async function restPut(endpoint: string, body: unknown) {
  const res = await fetch(`${REST_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function main() {
  console.log(`🔍 Store: ${STORE}\n`);

  // Step 1: Make products available on Online Store sales channel via REST
  // Get all products
  const productsData = await adminGql(`
    query { 
      products(first: 250) { 
        edges { node { id title status } } 
      } 
    }
  `);

  const products = productsData.products.edges;
  console.log(`📦 Found ${products.length} products\n`);

  // Use REST API to set published status on each product
  for (const edge of products) {
    const gid = edge.node.id;
    const numericId = gid.split("/").pop();
    const title = edge.node.title;

    try {
      // Set the product as published (makes it available on all channels)
      await restPut(`/products/${numericId}.json`, {
        product: {
          id: parseInt(numericId),
          published: true,
        },
      });
      console.log(`  ✅ Published: ${title}`);
    } catch (err) {
      console.error(`  ❌ Failed: ${title} — ${err}`);
    }
  }

  // Step 2: Get collections and publish them
  const collectionsData = await adminGql(`
    query { 
      collections(first: 50) { 
        edges { node { id title } } 
      } 
    }
  `);

  console.log(`\n📁 Found ${collectionsData.collections.edges.length} collections\n`);

  for (const edge of collectionsData.collections.edges) {
    const gid = edge.node.id;
    const numericId = gid.split("/").pop();
    const title = edge.node.title;

    try {
      await restPut(`/custom_collections/${numericId}.json`, {
        custom_collection: {
          id: parseInt(numericId),
          published: true,
        },
      });
      console.log(`  ✅ Published: ${title}`);
    } catch (err) {
      // Try as smart collection
      try {
        await restPut(`/smart_collections/${numericId}.json`, {
          smart_collection: {
            id: parseInt(numericId),
            published: true,
          },
        });
        console.log(`  ✅ Published: ${title}`);
      } catch {
        console.error(`  ❌ Failed: ${title}`);
      }
    }
  }

  console.log("\n🎉 Done! Refresh your site to see products.");
}

main().catch(console.error);
