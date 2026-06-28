import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listOrders } from "@/lib/shopify";

// GET /api/admin/orders — all orders (ADMIN only)
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const orders = await listOrders();
    return NextResponse.json(orders);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/admin/orders — update order status
// Note: Order status updates in Shopify are done via fulfillment actions
// For now, we return a message indicating to use Shopify admin for fulfillment
export async function PATCH() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(
    { error: "Order fulfillment is managed through Shopify admin" },
    { status: 501 }
  );
}
