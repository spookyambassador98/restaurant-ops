export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getShiftAnalytics } from "@/lib/analytics";
import { ManagerDashboard } from "@/components/staff/manager-dashboard";

export default async function ManagerPage() {
  const session = await getStaffSession();
  if (!session) redirect("/staff/login");

  const shift = await prisma.shift.findFirst({
    where: { status: "OPEN" },
    orderBy: { openedAt: "desc" },
  });

  const orders = shift
    ? await prisma.order.findMany({
        where: { shiftId: shift.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const analytics = shift ? await getShiftAnalytics(shift.id) : null;

  return (
    <ManagerDashboard
      initialShift={
        shift
          ? {
              id: shift.id,
              status: shift.status,
              openedAt: shift.openedAt.toISOString(),
            }
          : null
      }
      initialOrders={JSON.parse(JSON.stringify(orders))}
      initialAnalytics={analytics}
    />
  );
}
