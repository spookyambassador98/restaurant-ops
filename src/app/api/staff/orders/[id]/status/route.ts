import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { emitOpsEvent } from "@/lib/events";
import {
  recordOrderEvent,
  statusTimestampField,
  toPublicOrderWithEta,
} from "@/lib/orders";
import {
  canTransition,
  type OrderStatus,
  type StaffRole,
} from "@/lib/types/order";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status: toStatus } = body as { status: OrderStatus };

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fromStatus = order.status as OrderStatus;
  if (!canTransition(fromStatus, toStatus, session.role as StaffRole)) {
    return NextResponse.json({ error: "Transition not allowed" }, { status: 403 });
  }

  const tsField = statusTimestampField[toStatus];
  const data: Record<string, unknown> = { status: toStatus };
  if (tsField) {
    data[tsField] = new Date();
  }

  const updated = await prisma.order.update({
    where: { id },
    data,
    include: { items: true },
  });

  await recordOrderEvent(
    id,
    fromStatus,
    toStatus,
    session.role,
    session.id,
  );

  const publicOrder = await toPublicOrderWithEta(updated);
  emitOpsEvent({
    type: "order.status_changed",
    shiftId: updated.shiftId,
    publicId: updated.publicId,
    order: publicOrder,
  });

  return NextResponse.json(updated);
}
