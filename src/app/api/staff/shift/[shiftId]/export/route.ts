import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { getShiftAnalytics } from "@/lib/analytics";
import { formatMoney } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> },
) {
  const session = await getStaffSession();
  if (!session || (session.role !== "MANAGER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { shiftId } = await params;

  const orders = await prisma.order.findMany({
    where: { shiftId },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const header =
    "orderNumber,publicId,status,customerName,customerPhone,orderType,totalRub,createdAt,items\n";

  const rows = orders.map((o) => {
    const items = o.items
      .map((i) => `${i.quantity}x ${i.nameSnapshot}`)
      .join("; ");
    return [
      o.orderNumber,
      o.publicId,
      o.status,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerPhone,
      o.orderType,
      (o.totalCents / 100).toFixed(0),
      o.createdAt.toISOString(),
      `"${items.replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shift-${shiftId.slice(0, 8)}.csv"`,
    },
  });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> },
) {
  const session = await getStaffSession();
  if (!session || (session.role !== "MANAGER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { shiftId } = await params;
  const analytics = await getShiftAnalytics(shiftId);

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });

  return NextResponse.json({
    shift,
    summary: {
      ...analytics,
      revenueFormatted: formatMoney(analytics.revenue),
      avgPrepMinutes: Math.round(analytics.avgPrepTimeMs / 60000),
    },
  });
}
