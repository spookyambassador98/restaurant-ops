"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { MenuItemCard } from "@/components/public/menu-item-card";
import { useCart } from "@/components/public/cart-provider";
import { usePulse } from "@/hooks/use-pulse";
import { parseTags } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  tags: string;
  isAvailable: boolean;
  imageUrl: string | null;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
}

interface PublicPulse {
  kitchenOpen: boolean;
  stamp: string;
  catalogRev: string;
  items: { id: string; isAvailable: boolean; name: string }[];
}

export function MenuView({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [toast, setToast] = useState<string | null>(null);
  const { items: cart, removeItem } = useCart();
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const { data: pulse } = usePulse<PublicPulse>("/api/public/pulse", 1200);
  const prevAvail = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!pulse?.items) return;
    const next: Record<string, boolean> = {};
    for (const item of pulse.items) next[item.id] = item.isAvailable;

    for (const item of pulse.items) {
      const was = prevAvail.current[item.id];
      if (was === true && item.isAvailable === false) {
        setToast(`${item.name} снят с меню`);
        if (cartRef.current.some((c) => c.menuItemId === item.id)) {
          removeItem(item.id);
        }
      }
    }
    prevAvail.current = next;

    setCategories((cats) =>
      cats.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
          ...item,
          isAvailable: next[item.id] ?? item.isAvailable,
        })),
      })),
    );
  }, [pulse?.stamp, pulse?.items, removeItem]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const matchCat = activeCategory === "all" || cat.slug === activeCategory;
        const q = query.trim().toLowerCase();
        const matchQuery =
          !q ||
          item.name.toLowerCase().includes(q) ||
          (item.description?.toLowerCase().includes(q) ?? false);
        return matchCat && matchQuery;
      }),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-24 sm:px-6 md:pb-10">
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 bg-stone-950 px-4 py-2 text-sm text-amber-200 md:bottom-8">
          86 · {toast}
        </div>
      )}
      {pulse && !pulse.kitchenOpen && (
        <p className="mb-6 border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
          Кухня закрыта — смотрите меню, заказ откроется со сменой.
        </p>
      )}
      <p className="text-[11px] uppercase tracking-[0.28em] text-amber-800">Kitchen counter</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-stone-900">
        Меню
      </h1>
      <p className="mt-2 text-stone-600">Снятые позиции гаснут сразу — без обновления страницы.</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти блюдо"
            className="w-full border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-stone-900"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <CategoryTab
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            label="Все"
          />
          {categories.map((cat) => (
            <CategoryTab
              key={cat.slug}
              active={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              label={cat.name}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-12">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-stone-500">Ничего не найдено</p>
        )}
        {filtered.map((cat) => (
          <section key={cat.id}>
            <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl text-stone-800">
              {cat.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  priceCents={item.priceCents}
                  tags={parseTags(item.tags)}
                  isAvailable={item.isAvailable}
                  imageUrl={item.imageUrl}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CategoryTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium ${
        active
          ? "bg-stone-900 text-white"
          : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
      }`}
    >
      {label}
    </button>
  );
}
