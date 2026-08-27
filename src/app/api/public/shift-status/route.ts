import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const shift = await prisma.shift.findFirst({
    where: { status: "OPEN" },
    select: { id: true, openedAt: true },
  });

  return NextResponse.json({
    isOpen: Boolean(shift),
    shiftId: shift?.id ?? null,
  });
}
