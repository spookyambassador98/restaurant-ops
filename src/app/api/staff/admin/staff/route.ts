import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff-api";
import type { StaffRole } from "@/lib/types/order";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.staffUser.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { name, email, pin, role } = body as {
    name?: string;
    email?: string;
    pin?: string;
    role?: StaffRole;
  };

  if (!name?.trim() || !email?.trim() || !pin?.trim() || !role) {
    return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
  }

  if (!["MANAGER", "KITCHEN", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Неверная роль" }, { status: 400 });
  }

  const user = await prisma.staffUser.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      pin: pin.trim(),
      role,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json(user, { status: 201 });
}
