"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/public/cart-provider";
import { formatMoney } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalCents, count } = useCart();

  if (count === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <p className="text-stone-500">Корзина пуста</p>
        <Link
          href="/menu"
          className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2 text-white"
        >
          Перейти в меню
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-lg px-4 py-10 pb-32 sm:px-6 md:pb-10">
        <h1 className="text-2xl font-bold">Корзина</h1>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={item.menuItemId}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-stone-500">
                  {formatMoney(item.priceCents)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.menuItemId, item.quantity - 1)
                  }
                  className="rounded-lg p-1 hover:bg-stone-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.menuItemId, item.quantity + 1)
                  }
                  className="rounded-lg p-1 hover:bg-stone-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="rounded-lg p-1 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-between border-t border-stone-200 pt-4 text-lg font-semibold">
          <span>Итого</span>
          <span className="text-amber-700">{formatMoney(totalCents)}</span>
        </div>

        <Link
          href="/checkout"
          className="mt-6 hidden rounded-full bg-stone-900 py-3 text-center font-medium text-white hover:bg-stone-800 md:block"
        >
          Оформить заказ
        </Link>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white p-4 shadow-lg md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">{count} поз.</p>
            <p className="text-lg font-bold text-amber-700">
              {formatMoney(totalCents)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="flex-1 rounded-full bg-stone-900 py-3 text-center font-medium text-white hover:bg-stone-800"
          >
            Оформить заказ
          </Link>
        </div>
      </div>
    </>
  );
}
