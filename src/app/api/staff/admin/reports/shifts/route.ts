import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff-api";
import { formatMoney } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const shifts = await prisma.shift.findMany({
    orderBy: { openedAt: "desc" },
    include: {
      openedBy: { select: { name: true } },
      orders: {
        select: { status: true, totalCents: true },
      },
    },
    take: 30,
  });

  return NextResponse.json(
    shifts.map((s) => {
      const completed = s.orders.filter((o) => o.status === "COMPLETED");
      const revenue = completed.reduce((sum, o) => sum + o.totalCents, 0);
      return {
        id: s.id,
        status: s.status,
        openedAt: s.openedAt.toISOString(),
        closedAt: s.closedAt?.toISOString() ?? null,
        openedBy: s.openedBy.name,
        totalOrders: s.orders.length,
        completedOrders: completed.length,
        revenue,
        revenueFormatted: formatMoney(revenue),
      };
    }),
  );
}
