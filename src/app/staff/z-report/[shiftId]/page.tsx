export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getShiftAnalytics } from "@/lib/analytics";
import { formatMoney } from "@/lib/utils";
import { ZReportView } from "@/components/staff/z-report-view";

export default async function ZReportPage({
  params,
}: {
  params: Promise<{ shiftId: string }>;
}) {
  const session = await getStaffSession();
  if (!session) redirect("/staff/login");
  if (session.role === "KITCHEN") redirect("/staff/kitchen");

  const { shiftId } = await params;
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { openedBy: { select: { name: true } } },
  });
  if (!shift) redirect("/staff/manager");

  const analytics = await getShiftAnalytics(shiftId);
  const orders = await prisma.order.findMany({
    where: { shiftId, status: "COMPLETED" },
    include: { items: true },
    orderBy: { orderNumber: "asc" },
  });

  return (
    <ZReportView
      shiftId={shift.id}
      openedAt={shift.openedAt.toISOString()}
      closedAt={shift.closedAt?.toISOString() ?? null}
      openedBy={shift.openedBy.name}
      revenue={formatMoney(analytics.revenue)}
      totalOrders={analytics.totalOrders}
      completedOrders={analytics.completedOrders}
      cancelledOrders={analytics.cancelledOrders}
      cancelRate={analytics.cancelRate}
      avgPrepMinutes={Math.round(analytics.avgPrepTimeMs / 60000)}
      peakHour={analytics.peakHour}
      topItems={analytics.topItems}
      tickets={orders.map((o) => ({
        orderNumber: o.orderNumber,
        publicId: o.publicId,
        totalCents: o.totalCents,
        items: o.items.map((i) => `${i.quantity}× ${i.nameSnapshot}`).join(", "),
      }))}
    />
  );
}
