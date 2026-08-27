import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { emitOpsEvent } from "@/lib/events";

export async function POST(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || (session.role !== "MANAGER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { shiftId } = body as { shiftId?: string };

  const shift = shiftId
    ? await prisma.shift.findUnique({ where: { id: shiftId } })
    : await prisma.shift.findFirst({ where: { status: "OPEN" } });

  if (!shift || shift.status === "CLOSED") {
    return NextResponse.json({ error: "No open shift" }, { status: 404 });
  }

  const updated = await prisma.shift.update({
    where: { id: shift.id },
    data: { status: "CLOSED", closedAt: new Date() },
  });

  emitOpsEvent({ type: "shift.closed", shiftId: updated.id });

  return NextResponse.json(updated);
}
