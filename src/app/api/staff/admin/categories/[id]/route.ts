import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff-api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { name, slug, sortOrder, isActive } = body as {
    name?: string;
    slug?: string;
    sortOrder?: number;
    isActive?: boolean;
  };

  const category = await prisma.menuCategory.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(slug !== undefined && { slug: slug.trim().toLowerCase() }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const itemCount = await prisma.menuItem.count({ where: { categoryId: id } });
  if (itemCount > 0) {
    return NextResponse.json(
      { error: "Сначала удалите или переместите блюда категории" },
      { status: 400 },
    );
  }

  await prisma.menuCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
