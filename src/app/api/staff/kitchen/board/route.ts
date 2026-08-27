import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shiftId = request.nextUrl.searchParams.get("shiftId");

  const shift = shiftId
    ? await prisma.shift.findUnique({ where: { id: shiftId } })
    : await prisma.shift.findFirst({ where: { status: "OPEN" } });

  if (!shift) {
    return NextResponse.json([]);
  }

  const orders = await prisma.order.findMany({
    where: {
      shiftId: shift.id,
      status: { in: ["ACCEPTED", "COOKING", "READY"] },
    },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(orders);
}
