import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/auth/verify-email?token=xxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", req.url));
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid", req.url));
  }

  if (record.usedAt) {
    // Already verified — redirect to login
    return NextResponse.redirect(new URL("/login?verified=already", req.url));
  }

  if (record.expires < new Date()) {
    return NextResponse.redirect(new URL("/verify-email?error=expired", req.url));
  }

  // Mark email verified and token used — atomic
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
