/**
 * Analytics utility — tracks events for built-in reporting
 * and integrates with GA4 + Microsoft Clarity.
 */

// ── Server-side event tracking (writes to DB) ───────────────────────────────

export async function trackEvent(event: {
  eventType: string;
  userId?: string;
  sessionId?: string;
  productId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch {
    // Silently fail — analytics should never block UX
  }
}

// ── GA4 event helper ────────────────────────────────────────────────────────

type GA4Event = {
  event: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export function sendGA4Event({ event, ...params }: GA4Event) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", event, params);
  }
}

// ── Pre-built event helpers ─────────────────────────────────────────────────

export const analytics = {
  pageView: (pagePath: string) => {
    sendGA4Event({ event: "page_view", page_path: pagePath });
    trackEvent({ eventType: "page_view", metadata: { pagePath } });
  },

  productView: (productId: string, productName: string, price: number) => {
    sendGA4Event({
      event: "view_item",
      items: [{ item_id: productId, item_name: productName, price }],
    });
    trackEvent({ eventType: "product_view", productId, metadata: { productName, price } });
  },

  addToCart: (productId: string, productName: string, price: number, variant?: string) => {
    sendGA4Event({
      event: "add_to_cart",
      items: [{ item_id: productId, item_name: productName, price, variant }],
    });
    trackEvent({ eventType: "add_to_cart", productId, metadata: { productName, price, variant } });
  },

  removeFromCart: (productId: string) => {
    sendGA4Event({ event: "remove_from_cart", items: [{ item_id: productId }] });
    trackEvent({ eventType: "remove_from_cart", productId });
  },

  beginCheckout: (totalValue: number, itemCount: number) => {
    sendGA4Event({ event: "begin_checkout", value: totalValue, items_count: itemCount });
    trackEvent({ eventType: "checkout_start", metadata: { totalValue, itemCount } });
  },

  purchase: (orderId: string, totalValue: number) => {
    sendGA4Event({ event: "purchase", transaction_id: orderId, value: totalValue });
    trackEvent({ eventType: "order_complete", metadata: { orderId, totalValue } });
  },

  search: (query: string, resultsCount: number) => {
    sendGA4Event({ event: "search", search_term: query });
    trackEvent({ eventType: "search", metadata: { query, resultsCount } });
  },

  signup: (method: string) => {
    sendGA4Event({ event: "sign_up", method });
    trackEvent({ eventType: "signup", metadata: { method } });
  },

  login: (method: string) => {
    sendGA4Event({ event: "login", method });
    trackEvent({ eventType: "login", metadata: { method } });
  },
};
