import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { shopifyAdmin, extractId } from "@/lib/shopify";

// POST /api/orders — orders are now created through Shopify Checkout
// This endpoint is no longer needed for order creation
export async function POST() {
  return NextResponse.json(
    { error: "Orders are now created through Shopify Checkout. Use the checkoutUrl from /api/cart." },
    { status: 410 }
  );
}

// GET /api/orders — user's order history (by email)
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await shopifyAdmin<{
      orders: {
        edges: Array<{
          node: {
            id: string;
            name: string;
            createdAt: string;
            displayFulfillmentStatus: string;
            displayFinancialStatus: string;
            totalPriceSet: { shopMoney: { amount: string } };
            lineItems: {
              edges: Array<{
                node: {
                  title: string;
                  quantity: number;
                  originalUnitPriceSet: { shopMoney: { amount: string } };
                  variantTitle: string | null;
                  product: { id: string } | null;
                  image: { url: string } | null;
                };
              }>;
            };
          };
        }>;
      };
    }>(`
      query UserOrders($query: String!) {
        orders(first: 50, query: $query, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFulfillmentStatus
              displayFinancialStatus
              totalPriceSet { shopMoney { amount } }
              lineItems(first: 20) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet { shopMoney { amount } }
                    variantTitle
                    product { id }
                    image { url }
                  }
                }
              }
            }
          }
        }
      }
    `, { query: `email:${session.user.email}` });

    const orders = data.orders.edges.map((e) => {
      const node = e.node;
      return {
        id: extractId(node.id),
        orderNumber: node.name,
        status: mapStatus(node.displayFulfillmentStatus, node.displayFinancialStatus),
        totalAmount: Math.round(parseFloat(node.totalPriceSet.shopMoney.amount) * 100),
        createdAt: node.createdAt,
        items: node.lineItems.edges.map((li) => ({
          id: extractId(li.node.product?.id || ""),
          productId: li.node.product ? extractId(li.node.product.id) : "",
          quantity: li.node.quantity,
          unitPrice: Math.round(parseFloat(li.node.originalUnitPriceSet.shopMoney.amount) * 100),
          variant: li.node.variantTitle,
          product: {
            name: li.node.title,
            images: li.node.image ? [{ url: li.node.image.url }] : [],
          },
        })),
      };
    });

    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/orders] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function mapStatus(fulfillment: string, financial: string): string {
  if (financial === "REFUNDED") return "REFUNDED";
  if (fulfillment === "FULFILLED") return "DELIVERED";
  if (fulfillment === "IN_PROGRESS") return "SHIPPED";
  if (financial === "PAID") return "CONFIRMED";
  return "PENDING";
}
