import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitOpsEvent } from "@/lib/events";
import {
  getNextOrderNumber,
  recordOrderEvent,
  toPublicOrderWithEta,
} from "@/lib/orders";
import { generatePublicId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    customerName,
    customerPhone,
    orderType = "PICKUP",
    deliveryAddress,
    notes,
    items,
  } = body as {
    customerName: string;
    customerPhone: string;
    orderType?: "PICKUP" | "DELIVERY";
    deliveryAddress?: string;
    notes?: string;
    items: { menuItemId: string; quantity: number; notes?: string }[];
  };

  if (!customerName?.trim() || !customerPhone?.trim() || !items?.length) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const openShift = await prisma.shift.findFirst({ where: { status: "OPEN" } });
  if (!openShift) {
    return NextResponse.json({ error: "Kitchen closed" }, { status: 403 });
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) }, isAvailable: true },
  });

  if (menuItems.length !== items.length) {
    return NextResponse.json({ error: "Some items unavailable" }, { status: 400 });
  }

  const priceMap = new Map(menuItems.map((m) => [m.id, m]));

  const lineItems = items.map((item) => {
    const menuItem = priceMap.get(item.menuItemId)!;
    return {
      menuItemId: item.menuItemId,
      nameSnapshot: menuItem.name,
      priceCentsSnapshot: menuItem.priceCents,
      quantity: item.quantity,
      notes: item.notes || null,
    };
  });

  const subtotalCents = lineItems.reduce(
    (sum, i) => sum + i.priceCentsSnapshot * i.quantity,
    0,
  );

  let publicId = generatePublicId();
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await prisma.order.findUnique({ where: { publicId } });
    if (!exists) break;
    publicId = generatePublicId();
  }

  const orderNumber = await getNextOrderNumber();

  const order = await prisma.order.create({
    data: {
      publicId,
      orderNumber,
      shiftId: openShift.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderType,
      deliveryAddress: orderType === "DELIVERY" ? deliveryAddress?.trim() : null,
      notes: notes?.trim() || null,
      subtotalCents,
      totalCents: subtotalCents,
      items: { create: lineItems },
    },
    include: { items: true },
  });

  await recordOrderEvent(order.id, null, "NEW", "GUEST");

  const publicOrder = await toPublicOrderWithEta(order);
  emitOpsEvent({
    type: "order.created",
    shiftId: openShift.id,
    publicId: order.publicId,
    order: publicOrder,
  });

  return NextResponse.json(publicOrder, { status: 201 });
}
