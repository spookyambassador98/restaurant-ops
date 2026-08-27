import type { OrderStatus } from "@/lib/types/order";
import { prisma } from "@/lib/prisma";

const DEFAULT_PREP_MS = 18 * 60 * 1000;
const QUEUE_BUFFER_MS = 5 * 60 * 1000;

async function getShiftAvgPrepMs(shiftId: string | null): Promise<number> {
  if (!shiftId) return DEFAULT_PREP_MS;

  const completed = await prisma.order.findMany({
    where: { shiftId, status: "COMPLETED", acceptedAt: { not: null }, readyAt: { not: null } },
    select: { acceptedAt: true, readyAt: true },
    take: 50,
  });

  if (completed.length === 0) return DEFAULT_PREP_MS;

  const total = completed.reduce(
    (sum, o) => sum + (+new Date(o.readyAt!) - +new Date(o.acceptedAt!)),
    0,
  );
  return total / completed.length;
}

export interface OrderEta {
  etaMinutes: number | null;
  etaLabel: string;
}

export async function computeOrderEta(order: {
  status: OrderStatus;
  shiftId: string | null;
  createdAt: Date;
  acceptedAt: Date | null;
  cookingAt: Date | null;
  readyAt: Date | null;
}): Promise<OrderEta> {
  const { status } = order;

  if (status === "COMPLETED") {
    return { etaMinutes: null, etaLabel: "Заказ выдан" };
  }
  if (status === "CANCELLED" || status === "REJECTED") {
    return { etaMinutes: null, etaLabel: "Заказ отменён" };
  }
  if (status === "READY") {
    return { etaMinutes: 0, etaLabel: "Готов — можно забирать" };
  }

  const avgPrepMs = await getShiftAvgPrepMs(order.shiftId);
  const now = Date.now();
  let remainingMs: number;

  switch (status) {
    case "NEW":
      remainingMs = avgPrepMs + QUEUE_BUFFER_MS;
      break;
    case "ACCEPTED": {
      const acceptedAt = order.acceptedAt ? +order.acceptedAt : now;
      const elapsed = now - acceptedAt;
      remainingMs = Math.max(avgPrepMs - elapsed, 4 * 60 * 1000);
      break;
    }
    case "COOKING": {
      const cookingAt = order.cookingAt ? +order.cookingAt : now;
      const elapsed = now - cookingAt;
      remainingMs = Math.max(avgPrepMs * 0.65 - elapsed, 3 * 60 * 1000);
      break;
    }
    default:
      remainingMs = avgPrepMs;
  }

  const etaMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return { etaMinutes, etaLabel: `Примерно ${etaMinutes} мин` };
}
