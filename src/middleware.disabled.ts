/**
 * middleware.ts — Edge-compatible route protection.
 *
 * IMPORTANT: Do NOT import from @/lib/auth, @/lib/db, prisma, bcryptjs,
 * or any Node.js-only module here. Those imports exceed the 1 MB Edge limit.
 *
 * Instead we use `getToken` from next-auth/jwt — a tiny JWT-only helper
 * that reads the signed session cookie without touching the database.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// AUTH_SECRET is the NextAuth v5 canonical signing secret.
// NEXTAUTH_SECRET is kept as a fallback for v4 compat only.
// Both must be identical in .env and Vercel env vars.
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Decode JWT from cookie — no DB call, Edge-safe
  const token = await getToken({ req, secret });

  const role = (token?.role as string | undefined) ?? null;
  const isLoggedIn = Boolean(token);

  // ── Admin routes: require ADMIN or MARKETING role ──────────────────
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "ADMIN" && role !== "MARKETING") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── Checkout: require any authenticated user ────────────────────────
  if (pathname.startsWith("/checkout")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Cart & Orders API: require auth ────────────────────────────────
  if (
    (pathname.startsWith("/api/cart") || pathname.startsWith("/api/orders")) &&
    !isLoggedIn
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Reports API: require ADMIN/MARKETING or valid API key ──────────
  if (pathname.startsWith("/api/reports")) {
    const apiKey = req.headers.get("x-api-key");
    const validKey = process.env.REPORTS_API_KEY;

    // Allow external tools with a valid API key
    if (apiKey && validKey && apiKey === validKey) {
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (role !== "ADMIN" && role !== "MARKETING") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/reports/:path*",
  ],
};

