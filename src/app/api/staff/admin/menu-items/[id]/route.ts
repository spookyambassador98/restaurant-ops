import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff-api";
import { parseTags, stringifyTags } from "@/lib/utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const {
    categoryId,
    name,
    description,
    priceCents,
    imageUrl,
    tags,
    isAvailable,
  } = body as {
    categoryId?: string;
    name?: string;
    description?: string;
    priceCents?: number;
    imageUrl?: string | null;
    tags?: string[];
    isAvailable?: boolean;
  };

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(categoryId !== undefined && { categoryId }),
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(priceCents !== undefined && { priceCents }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
      ...(tags !== undefined && { tags: stringifyTags(tags) }),
      ...(isAvailable !== undefined && { isAvailable }),
    },
  });

  return NextResponse.json({ ...item, tags: parseTags(item.tags) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const orderItemCount = await prisma.orderItem.count({ where: { menuItemId: id } });
  if (orderItemCount > 0) {
    await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: false },
    });
    return NextResponse.json({ ok: true, softDeleted: true });
  }

  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
