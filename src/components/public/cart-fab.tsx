"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/public/cart-provider";
import { formatMoney } from "@/lib/utils";

export function CartFab() {
  const { count, totalCents } = useCart();

  if (count === 0) return null;

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-stone-900 px-5 py-3 text-white shadow-xl shadow-stone-900/30 transition hover:bg-stone-800 md:hidden"
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="font-medium">Корзина · {count}</span>
      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-sm font-semibold text-stone-900">
        {formatMoney(totalCents)}
      </span>
    </Link>
  );
}
