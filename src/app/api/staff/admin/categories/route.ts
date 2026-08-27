import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff-api";
import { parseTags, stringifyTags } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const categories = await prisma.menuCategory.findMany({
    include: {
      items: { orderBy: { name: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(
    categories.map((c) => ({
      ...c,
      items: c.items.map((i) => ({
        ...i,
        tags: parseTags(i.tags),
      })),
    })),
  );
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { name, slug, sortOrder = 0 } = body as {
    name?: string;
    slug?: string;
    sortOrder?: number;
  };

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Укажите название и slug" }, { status: 400 });
  }

  const category = await prisma.menuCategory.create({
    data: {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      sortOrder,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
