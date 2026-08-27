import { prisma } from "@/lib/prisma";
import { MenuView } from "@/components/public/menu-view";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    include: {
      items: {
        orderBy: [{ isAvailable: "desc" }, { name: "asc" }],
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return <MenuView categories={JSON.parse(JSON.stringify(categories))} />;
}
