import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff-api";
import type { StaffRole } from "@/lib/types/order";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { name, email, pin, role, isActive } = body as {
    name?: string;
    email?: string;
    pin?: string;
    role?: StaffRole;
    isActive?: boolean;
  };

  if (id === session!.id && isActive === false) {
    return NextResponse.json(
      { error: "Нельзя деактивировать свой аккаунт" },
      { status: 400 },
    );
  }

  const user = await prisma.staffUser.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim().toLowerCase() }),
      ...(pin !== undefined && { pin: pin.trim() }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json(user);
}
