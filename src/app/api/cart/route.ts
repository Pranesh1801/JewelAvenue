import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeCartLine,
  getProductVariantId,
} from "@/lib/shopify-storefront";

const CART_COOKIE = "shopify_cart_id";

/** Get or create a cart, returning the cartId */
async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(CART_COOKIE)?.value;

  if (existingId) {
    // Verify the cart still exists
    const cart = await getCart(existingId);
    if (cart) return existingId;
  }

  // Create new cart
  const cart = await createCart();
  return cart.cartId;
}

function setCartCookie(response: NextResponse, cartId: string): NextResponse {
  response.cookies.set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return response;
}

// GET /api/cart — get cart items
export async function GET() {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json([]);
    }

    const cart = await getCart(cartId);
    if (!cart) {
      return NextResponse.json([]);
    }

    // Return items in the shape the frontend expects + checkoutUrl
    const response = NextResponse.json({
      items: cart.items,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
    });
    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/cart] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/cart — add item to cart
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, variant, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const cartId = await getOrCreateCartId();

    // Get the variant ID for this product
    // If a specific variant was passed, use it; otherwise get the default variant
    let variantId = variant;
    if (!variantId || !variantId.startsWith("gid://")) {
      // Look up the first variant ID for this product
      variantId = await getProductVariantId(productId);
      if (!variantId) {
        return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
      }
    }

    const cart = await addToCart(cartId, variantId, quantity || 1);

    const response = NextResponse.json({
      success: true,
      items: cart.items,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
    });

    return setCartCookie(response, cart.cartId);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/cart] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/cart — update item quantity
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, quantity } = body;

    if (!id || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json({ error: "No cart found" }, { status: 404 });
    }

    const cart = await updateCartLine(cartId, id, quantity);

    return NextResponse.json({
      success: true,
      items: cart.items,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[PATCH /api/cart] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/cart — remove item or clear cart
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clear") === "true";

    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json({ error: "No cart found" }, { status: 404 });
    }

    if (clearAll) {
      // Get all line IDs and remove them
      const currentCart = await getCart(cartId);
      if (currentCart) {
        for (const item of currentCart.items) {
          await removeCartLine(cartId, item.id);
        }
      }
      // Clear the cookie
      const response = NextResponse.json({ success: true });
      response.cookies.delete(CART_COOKIE);
      return response;
    }

    if (!id) {
      return NextResponse.json({ error: "Provide id or clear=true" }, { status: 400 });
    }

    const cart = await removeCartLine(cartId, id);

    return NextResponse.json({
      success: true,
      items: cart.items,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[DELETE /api/cart] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
