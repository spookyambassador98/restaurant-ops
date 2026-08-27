import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    include: {
      items: {
        orderBy: [{ isAvailable: "desc" }, { name: "asc" }],
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(
    categories.map((c) => ({
      ...c,
      items: c.items.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        priceCents: i.priceCents,
        imageUrl: i.imageUrl,
        isAvailable: i.isAvailable,
        tags: parseTags(i.tags),
        categoryId: i.categoryId,
      })),
    })),
  );
}
