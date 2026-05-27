import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET /api/auth/reset-password?token=xxx — validate token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) {
    return NextResponse.json({ valid: false, error: "Invalid or expired token" }, { status: 400 });
  }

  if (record.usedAt) {
    return NextResponse.json({ valid: false, error: "This link has already been used" }, { status: 400 });
  }

  if (record.expires < new Date()) {
    return NextResponse.json({ valid: false, error: "This link has expired. Please request a new one." }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}

// POST /api/auth/reset-password — apply new password
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
    }

    if (record.usedAt) {
      return NextResponse.json({ error: "This link has already been used" }, { status: 400 });
    }

    if (record.expires < new Date()) {
      return NextResponse.json({ error: "This link has expired. Please request a new one." }, { status: 400 });
    }

    // Hash new password and mark token used — atomic transaction
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
