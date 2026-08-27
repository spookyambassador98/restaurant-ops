import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff-api";
import { parseTags, stringifyTags } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const {
    categoryId,
    name,
    description,
    priceCents,
    imageUrl,
    tags = [],
    isAvailable = true,
  } = body as {
    categoryId?: string;
    name?: string;
    description?: string;
    priceCents?: number;
    imageUrl?: string;
    tags?: string[];
    isAvailable?: boolean;
  };

  if (!categoryId || !name?.trim() || priceCents == null) {
    return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      categoryId,
      name: name.trim(),
      description: description?.trim() || null,
      priceCents,
      imageUrl: imageUrl?.trim() || null,
      tags: stringifyTags(tags),
      isAvailable,
    },
  });

  return NextResponse.json({ ...item, tags: parseTags(item.tags) }, { status: 201 });
}
