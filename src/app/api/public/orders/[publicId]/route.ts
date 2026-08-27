import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPublicOrderWithEta } from "@/lib/orders";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId: publicId.toUpperCase() },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(await toPublicOrderWithEta(order));
}
