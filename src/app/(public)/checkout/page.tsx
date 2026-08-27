"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCart } from "@/components/public/cart-provider";
import { usePulse } from "@/hooks/use-pulse";
import { formatMoney } from "@/lib/utils";

interface PublicPulse {
  kitchenOpen: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalCents, clearCart, count } = useCart();
  const { data: pulse } = usePulse<PublicPulse>("/api/public/pulse", 2000);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"CASH" | "CARD">("CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const kitchenOpen = pulse?.kitchenOpen ?? true;

  if (count === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-stone-500">Корзина пуста</p>
        <Link href="/menu" className="mt-4 inline-block text-amber-800">
          Вернуться в меню
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Укажите имя и телефон");
      return;
    }
    if (orderType === "DELIVERY" && !address.trim()) {
      setError("Укажите адрес доставки");
      return;
    }

    setLoading(true);
    setError("");

    const paymentNote =
      payment === "CASH" ? "Оплата: наличные при получении" : "Оплата: карта при получении";
    const combinedNotes = [notes.trim(), paymentNote].filter(Boolean).join(" · ");

    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          orderType,
          deliveryAddress: address,
          notes: combinedNotes,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error === "Kitchen closed"
            ? "Кухня закрыта — заказы временно недоступны"
            : data.error === "Some items unavailable"
              ? "Часть блюд сняли с меню — обновите корзину"
              : data.error || "Не удалось оформить заказ",
        );
      }

      clearCart();
      router.push(`/order/${data.publicId}/track`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-amber-800">Checkout</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">Оформление</h1>

      {!kitchenOpen && (
        <div className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Кухня закрыта — заказы сейчас недоступны.
        </div>
      )}

      <ul className="mt-6 space-y-2 text-sm text-stone-600">
        {items.map((i) => (
          <li key={i.menuItemId} className="flex justify-between">
            <span>
              {i.quantity}× {i.name}
            </span>
            <span>{formatMoney(i.priceCents * i.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-stone-200 pt-2 font-semibold text-stone-900">
          <span>Итого</span>
          <span>{formatMoney(totalCents)}</span>
        </li>
      </ul>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Имя *" value={name} onChange={setName} />
        <Field label="Телефон *" value={phone} onChange={setPhone} />
        <div>
          <label className="mb-2 block text-sm font-medium">Тип заказа</label>
          <div className="flex gap-2">
            {(["PICKUP", "DELIVERY"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`px-4 py-2 text-sm ${
                  orderType === t ? "bg-stone-900 text-white" : "border border-stone-300"
                }`}
              >
                {t === "PICKUP" ? "Самовывоз" : "Доставка"}
              </button>
            ))}
          </div>
        </div>
        {orderType === "DELIVERY" && (
          <Field label="Адрес *" value={address} onChange={setAddress} />
        )}
        <div>
          <label className="mb-2 block text-sm font-medium">Оплата при получении</label>
          <div className="flex gap-2">
            {(
              [
                { id: "CASH" as const, label: "Наличные" },
                { id: "CARD" as const, label: "Карта" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPayment(p.id)}
                className={`px-4 py-2 text-sm ${
                  payment === p.id ? "bg-stone-900 text-white" : "border border-stone-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Комментарий</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-stone-300 px-3 py-2"
            placeholder="Без лука, extra spicy"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !kitchenOpen}
          className="flex w-full items-center justify-center gap-2 bg-amber-700 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Подтвердить заказ
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-stone-300 px-3 py-2"
      />
    </div>
  );
}
