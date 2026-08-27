import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [shift, items] = await Promise.all([
    prisma.shift.findFirst({
      where: { status: "OPEN" },
      select: { id: true },
    }),
    prisma.menuItem.findMany({
      select: { id: true, isAvailable: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const catalogRev = items.map((i) => i.id).join(",");
  const stamp = items.map((i) => `${i.id}:${i.isAvailable ? 1 : 0}`).join(",");

  return NextResponse.json({
    kitchenOpen: Boolean(shift),
    shiftId: shift?.id ?? null,
    catalogRev,
    stamp,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      isAvailable: i.isAvailable,
    })),
  });
}
