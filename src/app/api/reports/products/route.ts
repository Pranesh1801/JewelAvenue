import { NextResponse } from "next/server";
import { shopifyAdmin } from "@/lib/shopify";

// GET /api/reports/products — top sellers, category breakdown
export async function GET() {
  try {
    // Get all orders with line items for top seller calculation
    const data = await shopifyAdmin<{
      orders: {
        edges: Array<{
          node: {
            lineItems: {
              edges: Array<{
                node: {
                  title: string;
                  quantity: number;
                  originalUnitPriceSet: { shopMoney: { amount: string } };
                  product: { id: string; title: string } | null;
                };
              }>;
            };
          };
        }>;
      };
      collections: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            handle: string;
            productsCount: { count: number };
          };
        }>;
      };
      products: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            variants: {
              edges: Array<{
                node: { inventoryQuantity: number };
              }>;
            };
          };
        }>;
      };
    }>(`
      query ReportProducts {
        orders(first: 100, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet { shopMoney { amount } }
                    product { id title }
                  }
                }
              }
            }
          }
        }
        collections(first: 50) {
          edges {
            node {
              id
              title
              handle
              productsCount { count }
            }
          }
        }
        products(first: 50, query: "status:ACTIVE") {
          edges {
            node {
              id
              title
              variants(first: 1) {
                edges {
                  node { inventoryQuantity }
                }
              }
            }
          }
        }
      }
    `);

    // Calculate top sellers
    const productSales = new Map<string, { name: string; quantity: number; revenue: number; orders: number }>();

    for (const orderEdge of data.orders.edges) {
      for (const liEdge of orderEdge.node.lineItems.edges) {
        const li = liEdge.node;
        const productId = li.product?.id || "unknown";
        const existing = productSales.get(productId) || { name: li.title, quantity: 0, revenue: 0, orders: 0 };
        existing.quantity += li.quantity;
        existing.revenue += parseFloat(li.originalUnitPriceSet?.shopMoney?.amount || "0") * li.quantity;
        existing.orders += 1;
        productSales.set(productId, existing);
      }
    }

    const topSellers = Array.from(productSales.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 20)
      .map(([productId, stats]) => ({
        productId: productId.split("/").pop() || productId,
        name: stats.name,
        displayPrice: "",
        totalQuantity: stats.quantity,
        totalRevenue: stats.revenue,
        orderCount: stats.orders,
      }));

    // Category breakdown
    const categories = data.collections.edges.map((e) => ({
      id: (e.node.id.split("/").pop() || e.node.id),
      title: e.node.title,
      slug: e.node.handle,
      productCount: e.node.productsCount.count,
      totalSold: 0,
      totalRevenue: 0,
    }));

    // Low stock alerts
    const lowStock = data.products.edges
      .map((e) => ({
        id: (e.node.id.split("/").pop() || e.node.id),
        name: e.node.title,
        stock: e.node.variants?.edges?.[0]?.node?.inventoryQuantity ?? 100,
        styleCode: "",
      }))
      .filter((p) => p.stock < 10)
      .sort((a, b) => a.stock - b.stock);

    return NextResponse.json({ topSellers, categories, lowStock });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/reports/products] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
