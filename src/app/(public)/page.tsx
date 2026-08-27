import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { LandingHero } from "@/components/public/landing-hero";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const bestsellers = await prisma.menuItem.findMany({
    where: { isAvailable: true, tags: { contains: "bestseller" } },
    take: 4,
    orderBy: { name: "asc" },
  });

  const featured =
    bestsellers.length >= 3
      ? bestsellers
      : await prisma.menuItem.findMany({
          where: { isAvailable: true },
          take: 4,
          orderBy: { name: "asc" },
        });

  return (
    <>
      <LandingHero />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 font-[family-name:var(--font-display)] text-3xl text-stone-900">
          Хиты
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <Link
              key={item.id}
              href="/menu"
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div
                className="mb-3 flex h-28 items-center justify-center rounded-xl bg-amber-50 text-3xl overflow-hidden bg-cover bg-center"
                style={
                  item.imageUrl
                    ? { backgroundImage: `url(${item.imageUrl})` }
                    : undefined
                }
              >
                {!item.imageUrl && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-amber-800">
                    Ember
                  </span>
                )}
              </div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                {item.description}
              </p>
              <p className="mt-2 font-semibold text-amber-700">
                {formatMoney(item.priceCents)}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-500"
          >
            Смотреть меню
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
