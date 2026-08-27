"use client";

import { Download, X } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface ShiftSummary {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  cancelRate: number;
  revenue: number;
  revenueFormatted: string;
  avgPrepMinutes: number;
  peakHour: { hour: number; orders: number; revenue: number } | null;
  topItems: { name: string; count: number }[];
}

export function ShiftSummaryModal({
  shiftId,
  summary,
  onConfirm,
  onCancel,
}: {
  shiftId: string;
  summary: ShiftSummary;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  function downloadCsv() {
    window.open(`/api/staff/shift/${shiftId}/export`, "_blank");
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100">Итоги смены</h2>
          <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Заказов" value={String(summary.totalOrders)} />
          <Stat label="Выручка" value={summary.revenueFormatted} />
          <Stat label="Выполнено" value={String(summary.completedOrders)} />
          <Stat label="Отмены" value={`${summary.cancelRate.toFixed(1)}%`} />
          <Stat label="Ср. готовка" value={`${summary.avgPrepMinutes} мин`} />
          {summary.peakHour && (
            <Stat
              label="Пиковый час"
              value={`${summary.peakHour.hour}:00 (${summary.peakHour.orders})`}
            />
          )}
        </div>

        {summary.topItems.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-zinc-500">Топ блюд</p>
            <ul className="space-y-1 text-sm text-zinc-300">
              {summary.topItems.slice(0, 3).map((i) => (
                <li key={i.name} className="flex justify-between">
                  <span>{i.name}</span>
                  <span>{i.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={downloadCsv}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-300"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
          <a
            href={`/staff/z-report/${shiftId}`}
            className="flex flex-1 items-center justify-center rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-300"
          >
            Z-отчёт
          </a>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-zinc-950"
          >
            Закрыть смену
          </button>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-800/60 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
