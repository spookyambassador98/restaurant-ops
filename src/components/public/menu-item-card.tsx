"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/public/cart-provider";
import { formatMoney } from "@/lib/utils";

const TAG_LABELS: Record<string, string> = {
  bestseller: "Хит",
  vegan: "Веган",
  spicy: "Острое",
};

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  tags: string[];
  isAvailable: boolean;
  imageUrl?: string | null;
}

export function MenuItemCard({
  id,
  name,
  description,
  priceCents,
  tags,
  isAvailable,
  imageUrl,
}: MenuItemCardProps) {
  const { addItem, updateQuantity, items } = useCart();
  const inCart = items.find((i) => i.menuItemId === id);
  const qty = inCart?.quantity ?? 0;

  if (!isAvailable) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 opacity-70">
        <div className="relative mb-3 h-32 overflow-hidden rounded-xl bg-stone-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover grayscale"
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50">
            <span className="bg-stone-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              86
            </span>
          </div>
        </div>
        <h3 className="font-medium text-stone-600">{name}</h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-400">{description}</p>
        )}
        <p className="mt-3 text-sm font-medium text-stone-400">Недоступно</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="relative mb-3 h-32 overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-stone-100 text-[10px] uppercase tracking-[0.2em] text-stone-400">
            Ember
          </span>
        )}
      </div>
      <div className="mb-1 flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800"
          >
            {TAG_LABELS[tag] ?? tag}
          </span>
        ))}
      </div>
      <h3 className="font-semibold text-stone-900">{name}</h3>
      {description && (
        <p className="mt-1 line-clamp-2 text-sm text-stone-500">{description}</p>
      )}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-lg font-semibold text-amber-700">
          {formatMoney(priceCents)}
        </span>
        {qty === 0 ? (
          <button
            onClick={() => addItem({ menuItemId: id, name, priceCents })}
            className="flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            В корзину
          </button>
        ) : (
          <div className="flex items-center gap-1 rounded-full bg-stone-100 p-1">
            <button
              onClick={() => updateQuantity(id, qty - 1)}
              className="rounded-full p-1.5 hover:bg-white"
              aria-label="Уменьшить"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-6 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => updateQuantity(id, qty + 1)}
              className="rounded-full p-1.5 hover:bg-white"
              aria-label="Увеличить"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
