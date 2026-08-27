"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/public/cart-provider";

export function PublicHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-stone-900">
            Ember Kitchen
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/menu" className="text-stone-600 hover:text-stone-900">
            Меню
          </Link>
          <Link href="/track" className="text-stone-600 hover:text-stone-900">
            Отследить заказ
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500"
          >
            <ShoppingBag className="h-4 w-4" />
            Корзина
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-xs text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
