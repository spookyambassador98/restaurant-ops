import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStaffSession } from "@/lib/auth";
import type { StaffRole } from "@/lib/types/order";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, pin } = body as { email?: string; pin?: string };

  if (!email?.trim() || !pin?.trim()) {
    return NextResponse.json({ error: "Укажите email и PIN" }, { status: 400 });
  }

  const user = await prisma.staffUser.findFirst({
    where: { email: email.trim().toLowerCase(), pin: pin.trim(), isActive: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Неверный логин или PIN" }, { status: 401 });
  }

  await createStaffSession({
    id: user.id,
    name: user.name,
    role: user.role as StaffRole,
    email: user.email,
  });

  const redirect =
    user.role === "ADMIN"
      ? "/staff/admin"
      : user.role === "KITCHEN"
        ? "/staff/kitchen"
        : "/staff/manager";

  return NextResponse.json({ ok: true, role: user.role, redirect });
}
