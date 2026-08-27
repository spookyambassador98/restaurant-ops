"use client";

import { formatMoney } from "@/lib/utils";

interface Ticket {
  orderNumber: number;
  publicId: string;
  totalCents: number;
  items: string;
}

export function ZReportView({
  shiftId,
  openedAt,
  closedAt,
  openedBy,
  revenue,
  totalOrders,
  completedOrders,
  cancelledOrders,
  cancelRate,
  avgPrepMinutes,
  peakHour,
  topItems,
  tickets,
}: {
  shiftId: string;
  openedAt: string;
  closedAt: string | null;
  openedBy: string;
  revenue: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  cancelRate: number;
  avgPrepMinutes: number;
  peakHour: { hour: number; orders: number } | null;
  topItems: { name: string; count: number }[];
  tickets: Ticket[];
}) {
  return (
    <div className="min-h-screen bg-[#f4efe4] text-stone-900 print:bg-white">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between print:hidden">
          <a href="/staff/manager" className="text-sm text-stone-500">
            ← Назад
          </a>
          <button
            onClick={() => window.print()}
            className="bg-stone-900 px-4 py-2 text-sm text-white"
          >
            Печать Z-отчёта
          </button>
        </div>

        <header className="border-b border-dashed border-stone-400 pb-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em]">Ember Kitchen</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
            Z-отчёт смены
          </h1>
          <p className="mt-2 font-mono text-xs text-stone-500">
            {shiftId.slice(0, 10)} · {openedBy}
          </p>
        </header>

        <p className="mt-4 font-mono text-xs">
          Открыта {new Date(openedAt).toLocaleString("ru-RU")}
          {closedAt
            ? ` · закрыта ${new Date(closedAt).toLocaleString("ru-RU")}`
            : " · ещё открыта"}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ZStat label="Выручка" value={revenue} />
          <ZStat label="Заказов" value={String(totalOrders)} />
          <ZStat label="Выдано" value={String(completedOrders)} />
          <ZStat label="Отмены" value={`${cancelRate.toFixed(1)}% (${cancelledOrders})`} />
          <ZStat label="Средний prep" value={`${avgPrepMinutes} мин`} />
          <ZStat
            label="Пик"
            value={peakHour ? `${peakHour.hour}:00 · ${peakHour.orders} зак.` : "—"}
          />
        </div>

        <h2 className="mt-8 text-xs uppercase tracking-[0.2em] text-stone-500">
          Топ блюд
        </h2>
        <ul className="mt-2 space-y-1 font-mono text-sm">
          {topItems.map((item) => (
            <li key={item.name} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.count}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-xs uppercase tracking-[0.2em] text-stone-500">
          Выданные чеки
        </h2>
        <table className="mt-2 w-full font-mono text-xs">
          <thead>
            <tr className="border-b border-stone-300 text-left text-stone-500">
              <th className="py-1">№</th>
              <th>Код</th>
              <th>Состав</th>
              <th className="text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.publicId} className="border-b border-stone-200">
                <td className="py-1.5">{t.orderNumber}</td>
                <td>{t.publicId}</td>
                <td className="max-w-[12rem] truncate">{t.items}</td>
                <td className="text-right">{formatMoney(t.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-stone-400">
          Конец отчёта · не фискальный документ
        </p>
      </div>
    </div>
  );
}

function ZStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-stone-300 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
