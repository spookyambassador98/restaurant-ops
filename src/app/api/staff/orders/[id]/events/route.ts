import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { ORDER_STATUS_LABELS } from "@/lib/types/order";
import type { OrderStatus } from "@/lib/types/order";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const events = await prisma.orderEvent.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
    include: { actor: { select: { name: true } } },
  });

  return NextResponse.json(
    events.map((e) => ({
      id: e.id,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
      toStatusLabel: ORDER_STATUS_LABELS[e.toStatus as OrderStatus],
      fromStatusLabel: e.fromStatus
        ? ORDER_STATUS_LABELS[e.fromStatus as OrderStatus]
        : null,
      actorRole: e.actorRole,
      actorName: e.actor?.name ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
  );
}
