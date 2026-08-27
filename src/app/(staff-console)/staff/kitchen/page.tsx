export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { KitchenBoard } from "@/components/staff/kitchen-board";

export default async function KitchenPage() {
  const session = await getStaffSession();
  if (!session) redirect("/staff/login");

  const shift = await prisma.shift.findFirst({
    where: { status: "OPEN" },
    orderBy: { openedAt: "desc" },
  });

  const orders = shift
    ? await prisma.order.findMany({
        where: {
          shiftId: shift.id,
          status: { in: ["ACCEPTED", "COOKING", "READY"] },
        },
        include: { items: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <KitchenBoard
      shiftId={shift?.id ?? null}
      initialOrders={JSON.parse(JSON.stringify(orders))}
    />
  );
}
