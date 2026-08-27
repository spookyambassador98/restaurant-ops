import { prisma } from "@/lib/prisma";

export async function getShiftAnalytics(shiftId: string) {
  const orders = await prisma.order.findMany({
    where: { shiftId },
    select: {
      status: true,
      totalCents: true,
      createdAt: true,
      acceptedAt: true,
      readyAt: true,
      items: { select: { nameSnapshot: true, quantity: true } },
    },
  });

  const completed = orders.filter((o) => o.status === "COMPLETED");
  const cancelled = orders.filter(
    (o) => o.status === "CANCELLED" || o.status === "REJECTED",
  );

  const revenue = completed.reduce((s, o) => s + o.totalCents, 0);
  const hourly = new Map<number, { orders: number; revenue: number }>();
  for (let h = 0; h < 24; h++) hourly.set(h, { orders: 0, revenue: 0 });

  for (const o of completed) {
    const h = new Date(o.createdAt).getHours();
    const entry = hourly.get(h)!;
    entry.orders += 1;
    entry.revenue += o.totalCents;
  }

  const itemCounts = new Map<string, number>();
  for (const o of completed) {
    for (const item of o.items) {
      itemCounts.set(
        item.nameSnapshot,
        (itemCounts.get(item.nameSnapshot) ?? 0) + item.quantity,
      );
    }
  }

  const prepTimes = completed
    .filter((o) => o.acceptedAt && o.readyAt)
    .map((o) => +new Date(o.readyAt!) - +new Date(o.acceptedAt!));

  const hourlyList = Array.from(hourly.entries()).map(([hour, data]) => ({
    hour,
    label: `${hour}:00`,
    ...data,
  }));

  const peakHours = [...hourlyList]
    .filter((h) => h.orders > 0)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 3);

  return {
    totalOrders: orders.length,
    completedOrders: completed.length,
    cancelledOrders: cancelled.length,
    cancelRate:
      orders.length > 0 ? (cancelled.length / orders.length) * 100 : 0,
    revenue,
    avgPrepTimeMs:
      prepTimes.length > 0
        ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length
        : 0,
    hourly: hourlyList,
    peakHours,
    peakHour: peakHours[0] ?? null,
    topItems: Array.from(itemCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    inProgress: {
      accepted: orders.filter((o) => o.status === "ACCEPTED").length,
      cooking: orders.filter((o) => o.status === "COOKING").length,
      ready: orders.filter((o) => o.status === "READY").length,
    },
  };
}
