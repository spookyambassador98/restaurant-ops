import { formatMoney } from "@/lib/utils";

export function ThermalReceipt({
  publicId,
  orderNumber,
  items,
  totalCents,
  notes,
  orderType,
  createdAt,
}: {
  publicId: string;
  orderNumber: number;
  items: { nameSnapshot: string; quantity: number; priceCentsSnapshot: number }[];
  totalCents: number;
  notes?: string | null;
  orderType?: string;
  createdAt?: string;
}) {
  return (
    <div className="receipt mx-auto w-full max-w-sm bg-[#f6f1e3] px-5 py-6 text-stone-900 shadow-[0_0_0_1px_rgba(28,25,23,0.12)]">
      <p className="text-center text-[10px] uppercase tracking-[0.28em]">
        Ember Kitchen
      </p>
      <p className="mt-1 text-center font-[family-name:var(--font-display)] text-2xl">
        Чек заказа
      </p>
      <div className="mt-4 flex justify-between font-mono text-xs">
        <span>#{orderNumber}</span>
        <span>{publicId}</span>
      </div>
      {createdAt && (
        <p className="mt-1 font-mono text-[11px] text-stone-500">
          {new Date(createdAt).toLocaleString("ru-RU")}
          {orderType ? ` · ${orderType}` : ""}
        </p>
      )}
      <div className="my-3 border-t border-dashed border-stone-400" />
      <ul className="space-y-1 font-mono text-xs">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span>
              {item.quantity}× {item.nameSnapshot}
            </span>
            <span>{formatMoney(item.priceCentsSnapshot * item.quantity)}</span>
          </li>
        ))}
      </ul>
      {notes && (
        <p className="mt-3 text-xs text-stone-600">
          {notes}
        </p>
      )}
      <div className="my-3 border-t border-dashed border-stone-400" />
      <div className="flex justify-between font-mono text-sm font-semibold">
        <span>ИТОГО</span>
        <span>{formatMoney(totalCents)}</span>
      </div>
      <p className="mt-4 text-center text-[10px] uppercase tracking-[0.18em] text-stone-500">
        Оплата при получении
      </p>
    </div>
  );
}
