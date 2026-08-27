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
    : await prisma.shift.findFirst({
        where: { status: "OPEN" },
        orderBy: { openedAt: "desc" },
      });

  if (!shift) {
    return NextResponse.json([]);
  }

  const orders = await prisma.order.findMany({
    where: { shiftId: shift.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      publicId: o.publicId,
      orderNumber: o.orderNumber,
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      orderType: o.orderType,
      deliveryAddress: o.deliveryAddress,
      totalCents: o.totalCents,
      notes: o.notes,
      shiftId: o.shiftId,
      createdAt: o.createdAt.toISOString(),
      acceptedAt: o.acceptedAt?.toISOString() ?? null,
      cookingAt: o.cookingAt?.toISOString() ?? null,
      readyAt: o.readyAt?.toISOString() ?? null,
      items: o.items,
    })),
  );
}
