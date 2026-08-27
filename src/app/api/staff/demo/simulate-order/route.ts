import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { emitOpsEvent } from "@/lib/events";
import {
  getNextOrderNumber,
  recordOrderEvent,
  toPublicOrderWithEta,
} from "@/lib/orders";

export async function POST() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shift = await prisma.shift.findFirst({ where: { status: "OPEN" } });
  if (!shift) {
    return NextResponse.json({ error: "No open shift" }, { status: 400 });
  }

  const item = await prisma.menuItem.findFirst({ where: { isAvailable: true } });
  if (!item) {
    return NextResponse.json({ error: "No menu items" }, { status: 400 });
  }

  const orderNumber = await getNextOrderNumber();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let publicId = "DEMO" + chars[Math.floor(Math.random() * chars.length)];

  const order = await prisma.order.create({
    data: {
      publicId,
      orderNumber,
      shiftId: shift.id,
      customerName: "Демо-гость",
      customerPhone: "+79000000000",
      orderType: "PICKUP",
      subtotalCents: item.priceCents,
      totalCents: item.priceCents,
      status: "NEW",
      items: {
        create: {
          menuItemId: item.id,
          nameSnapshot: item.name,
          priceCentsSnapshot: item.priceCents,
          quantity: 1,
        },
      },
    },
    include: { items: true },
  });

  await recordOrderEvent(order.id, null, "NEW", "DEMO");

  const publicOrder = await toPublicOrderWithEta(order);
  emitOpsEvent({
    type: "order.created",
    shiftId: shift.id,
    publicId: order.publicId,
    order: publicOrder,
  });

  return NextResponse.json(publicOrder, { status: 201 });
}
