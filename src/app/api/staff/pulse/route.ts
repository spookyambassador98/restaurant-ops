import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;

  const shiftIdParam = request.nextUrl.searchParams.get("shiftId");

  const [shift, items, latestOrder] = await Promise.all([
    shiftIdParam
      ? prisma.shift.findUnique({ where: { id: shiftIdParam } })
      : prisma.shift.findFirst({
          where: { status: "OPEN" },
          orderBy: { openedAt: "desc" },
        }),
    prisma.menuItem.findMany({
      select: {
        id: true,
        name: true,
        isAvailable: true,
        category: { select: { name: true } },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    }),
    prisma.order.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ]);

  const ordersRev = shift
    ? (
        await prisma.order.findFirst({
          where: { shiftId: shift.id },
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true, id: true },
        })
      )?.updatedAt?.toISOString() ?? "none"
    : "none";

  return NextResponse.json({
    kitchenOpen: shift?.status === "OPEN",
    shiftId: shift?.id ?? null,
    ordersRev,
    menuStamp: items.map((i) => `${i.id}:${i.isAvailable ? 1 : 0}`).join(","),
    globalTouch: latestOrder?.updatedAt.toISOString() ?? null,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      isAvailable: i.isAvailable,
      category: i.category.name,
    })),
  });
}
