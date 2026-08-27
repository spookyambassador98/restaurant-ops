import type { OrderStatus } from "@/lib/types/order";
import { prisma } from "@/lib/prisma";
import { computeOrderEta } from "@/lib/eta";

const orderInclude = {
  items: true,
};

export function toPublicOrder(order: {
  publicId: string;
  orderNumber: number;
  status: OrderStatus;
  customerName: string;
  orderType: string;
  totalCents: number;
  notes: string | null;
  createdAt: Date;
  items: { nameSnapshot: string; quantity: number; priceCentsSnapshot: number }[];
  etaMinutes?: number | null;
  etaLabel?: string;
}) {
  return {
    publicId: order.publicId,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    orderType: order.orderType,
    totalCents: order.totalCents,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    etaMinutes: order.etaMinutes ?? null,
    etaLabel: order.etaLabel ?? "",
    items: order.items.map((i) => ({
      nameSnapshot: i.nameSnapshot,
      quantity: i.quantity,
      priceCentsSnapshot: i.priceCentsSnapshot,
    })),
  };
}

export async function toPublicOrderWithEta(order: {
  publicId: string;
  orderNumber: number;
  status: OrderStatus;
  shiftId: string | null;
  customerName: string;
  orderType: string;
  totalCents: number;
  notes: string | null;
  createdAt: Date;
  acceptedAt: Date | null;
  cookingAt: Date | null;
  readyAt: Date | null;
  items: { nameSnapshot: string; quantity: number; priceCentsSnapshot: number }[];
}) {
  const eta = await computeOrderEta(order);
  return toPublicOrder({ ...order, ...eta });
}

export async function getNextOrderNumber() {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(482910)`;
    const last = await tx.order.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    return (last?.orderNumber ?? 1000) + 1;
  });
}

export async function recordOrderEvent(
  orderId: string,
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus,
  actorRole: string,
  actorUserId?: string,
) {
  await prisma.orderEvent.create({
    data: {
      orderId,
      fromStatus: fromStatus ?? undefined,
      toStatus,
      actorRole,
      actorUserId,
    },
  });
}

export const statusTimestampField: Partial<
  Record<OrderStatus, keyof Pick<
    import("@/generated/prisma/client").Order,
    "acceptedAt" | "cookingAt" | "readyAt" | "completedAt" | "cancelledAt"
  >>
> = {
  ACCEPTED: "acceptedAt",
  COOKING: "cookingAt",
  READY: "readyAt",
  COMPLETED: "completedAt",
  CANCELLED: "cancelledAt",
  REJECTED: "cancelledAt",
};

export { orderInclude };
