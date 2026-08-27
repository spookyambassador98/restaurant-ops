import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { emitOpsEvent } from "@/lib/events";

export async function POST() {
  const session = await getStaffSession();
  if (!session || (session.role !== "MANAGER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.shift.updateMany({
    where: { status: "OPEN" },
    data: { status: "CLOSED", closedAt: new Date() },
  });

  const shift = await prisma.shift.create({
    data: {
      openedByUserId: session.id,
      status: "OPEN",
    },
  });

  emitOpsEvent({ type: "shift.opened", shiftId: shift.id });

  return NextResponse.json(shift, { status: 201 });
}
