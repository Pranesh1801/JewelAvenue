import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Admin routes — require ADMIN or MARKETING role
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "MARKETING") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Checkout — require auth
  if (pathname.startsWith("/checkout")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API routes for cart and orders — require auth
  if (
    (pathname.startsWith("/api/cart") || pathname.startsWith("/api/orders")) &&
    !session
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reporting API — require ADMIN/MARKETING role or API key
  if (pathname.startsWith("/api/reports")) {
    const apiKey = req.headers.get("x-api-key");
    const validKey = process.env.REPORTS_API_KEY;

    if (apiKey && validKey && apiKey === validKey) {
      return NextResponse.next(); // external tool with valid API key
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "MARKETING") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/reports/:path*",
  ],
};
