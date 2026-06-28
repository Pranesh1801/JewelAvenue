import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/users
export async function GET(req: NextRequest) {
  const session = await auth();
  // Only ADMIN may access customer PII (names, emails, phones)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const search = req.nextUrl.searchParams.get("search") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, name: true, email: true, role: true, phone: true, createdAt: true,
      _count: { select: { orders: true, cartItems: true } },
    },
  });

  return NextResponse.json({ users });
}

// PATCH /api/admin/users — update user role
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, role } = body;

  if (!id || !role || !["CUSTOMER", "ADMIN", "MARKETING"].includes(role)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: role as never },
  });

  return NextResponse.json({ id: user.id, role: user.role });
}
