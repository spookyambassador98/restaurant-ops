import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff-api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireStaff(["ADMIN", "MANAGER", "KITCHEN"]);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { isAvailable } = body as { isAvailable?: boolean };

  if (typeof isAvailable !== "boolean") {
    return NextResponse.json({ error: "isAvailable required" }, { status: 400 });
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
    select: { id: true, name: true, isAvailable: true },
  });

  return NextResponse.json(item);
}
