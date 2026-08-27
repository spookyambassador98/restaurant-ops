"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, ExternalLink } from "lucide-react";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { OrderDetailPanel } from "@/components/staff/order-detail-panel";
import { ShiftSummaryModal } from "@/components/staff/shift-summary-modal";
import { EightySixRail, type EightySixItem } from "@/components/staff/eighty-six-rail";
import { usePulse } from "@/hooks/use-pulse";
import type { OrderStatus, StaffOrder } from "@/lib/types/order";
import { ORDER_TYPE_LABELS } from "@/lib/types/order";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { formatAge, ticketAgeLevel, ticketAgeMs } from "@/lib/ops";
import { useNow } from "@/hooks/use-now";

interface ShiftInfo {
  id: string;
  status: string;
  openedAt: string;
}

interface Analytics {
  totalOrders: number;
  revenue: number;
  cancelRate: number;
  avgPrepTimeMs: number;
  hourly: { hour: number; label?: string; orders: number; revenue: number }[];
  peakHours: { hour: number; orders: number; revenue: number }[];
  peakHour: { hour: number; orders: number; revenue: number } | null;
  topItems: { name: string; count: number }[];
  inProgress: { accepted: number; cooking: number; ready: number };
}

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

export function ManagerDashboard({
  initialShift,
  initialOrders,
  initialAnalytics,
}: {
  initialShift: ShiftInfo | null;
  initialOrders: StaffOrder[];
  initialAnalytics: Analytics | null;
}) {
  const [shift, setShift] = useState(initialShift);
  const [orders, setOrders] = useState(initialOrders);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [tab, setTab] = useState<"orders" | "analytics">("orders");
  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null);
  const [closeSummary, setCloseSummary] = useState<ShiftSummary | null>(null);
  const pulseUrl = shift?.id ? `/api/staff/pulse?shiftId=${shift.id}` : "/api/staff/pulse";
  const { data: pulse, live } = usePulse<{
    ordersRev: string;
    items: EightySixItem[];
  }>(pulseUrl, 1200);

  async function refresh() {
    if (!shift?.id) return;
    const [ordersRes, analyticsRes] = await Promise.all([
      fetch(`/api/staff/orders?shiftId=${shift.id}`),
      fetch(`/api/staff/analytics/shift/${shift.id}`),
    ]);
    setOrders(await ordersRes.json());
    setAnalytics(await analyticsRes.json());
  }

  useEffect(() => {
    if (!shift?.id) return;
    void refresh();
  }, [pulse?.ordersRev, shift?.id]);

  async function updateStatus(id: string, status: OrderStatus) {
    await fetch(`/api/staff/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refresh();
    if (selectedOrder?.id === id) {
      const res = await fetch(`/api/staff/orders?shiftId=${shift!.id}`);
      const all = await res.json();
      setSelectedOrder(all.find((o: StaffOrder) => o.id === id) ?? null);
    }
  }

  async function openShift() {
    const res = await fetch("/api/staff/shift/open", { method: "POST" });
    const data = await res.json();
    setShift(data);
    await refresh();
  }

  async function requestCloseShift() {
    if (!shift) return;
    const res = await fetch(`/api/staff/shift/${shift.id}/export`, {
      method: "POST",
    });
    const data = await res.json();
    setCloseSummary(data.summary);
  }

  async function confirmCloseShift() {
    if (!shift) return;
    await fetch("/api/staff/shift/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId: shift.id }),
    });
    setShift({ ...shift, status: "CLOSED" });
    setCloseSummary(null);
  }

  const now = useNow(1000);

  const active = orders.filter((o) =>
    ["NEW", "ACCEPTED", "COOKING", "READY"].includes(o.status),
  );

  const hourlyChart = (analytics?.hourly ?? [])
    .filter((h) => h.orders > 0)
    .map((h) => ({ ...h, label: `${h.hour}:00` }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">Менеджер</h1>
          <p className="text-sm text-zinc-500">
            {live ? "Live 1.2с" : "Нет связи"} · Смена{" "}
            {shift?.status === "OPEN"
              ? "открыта"
              : shift?.status === "CLOSED"
                ? "закрыта"
                : "нет"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {shift?.status === "OPEN" ? (
            <>
              <button
                onClick={requestCloseShift}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-300"
              >
                Закрыть смену
              </button>
              <a
                href={`/api/staff/shift/${shift.id}/export`}
                className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400"
              >
                <Download className="h-4 w-4" />
                CSV
              </a>
              <Link
                href="/staff/kitchen"
                className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400"
              >
                <ExternalLink className="h-4 w-4" />
                Кухня
              </Link>
              <a
                href={`/staff/z-report/${shift.id}`}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400"
              >
                Z-отчёт
              </a>
            </>
          ) : (
            <button
              onClick={openShift}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-zinc-950"
            >
              Открыть смену
            </button>
          )}
        </div>
      </div>

      {pulse?.items && <EightySixRail items={pulse.items} />}

      {analytics && (
        <div className="grid gap-3 sm:grid-cols-4">
          <Kpi label="Заказов" value={String(analytics.totalOrders)} />
          <Kpi label="Выручка" value={formatMoney(analytics.revenue)} />
          <Kpi
            label="Ср. время"
            value={`${Math.round(analytics.avgPrepTimeMs / 60000)} мин`}
          />
          <Kpi label="Отмены" value={`${analytics.cancelRate.toFixed(1)}%`} />
        </div>
      )}

      {analytics && analytics.peakHours.length > 0 && tab === "analytics" && (
        <div className="flex gap-3">
          {analytics.peakHours.map((p, i) => (
            <div
              key={p.hour}
              className={`flex-1 rounded-xl px-4 py-3 text-center ${
                i === 0
                  ? "bg-amber-500/20 ring-1 ring-amber-500/40"
                  : "bg-zinc-900/60"
              }`}
            >
              <p className="text-xs text-zinc-500">#{i + 1} пик</p>
              <p className="text-lg font-bold text-amber-400">{p.hour}:00</p>
              <p className="text-xs text-zinc-400">{p.orders} заказов</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {(["orders", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === t
                ? "bg-zinc-800 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t === "orders" ? "Заказы live" : "Аналитика смены"}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-3">
          {active.length === 0 && (
            <p className="py-8 text-center text-zinc-500">Нет активных заказов</p>
          )}
          {active.map((order) => {
            const age = ticketAgeMs(now, {
              createdAt: order.createdAt,
              acceptedAt: order.acceptedAt,
              cookingAt: order.cookingAt,
              readyAt: order.readyAt,
              status: order.status,
            });
            const level = ticketAgeLevel(age);
            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full p-4 text-left ${
                  level === "late"
                    ? "border border-red-500/50 bg-red-950/30"
                    : "border border-zinc-800 bg-zinc-900/60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-2xl font-bold text-amber-400">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                    <p className="mt-1 text-sm text-zinc-400">
                      {order.customerName} · {ORDER_TYPE_LABELS[order.orderType]}{" "}
                      · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatMoney(order.totalCents)}</p>
                    <p
                      className={`font-mono text-xs ${
                        level === "late" ? "text-red-400" : "text-zinc-500"
                      }`}
                    >
                      {formatAge(age)}
                    </p>
                  </div>
                </div>
                <ul className="mt-2 text-sm text-zinc-500">
                  {order.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity}× {i.nameSnapshot}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
          {analytics && (
            <p className="text-xs text-zinc-600">
              Кухня: {analytics.inProgress.accepted} принято ·{" "}
              {analytics.inProgress.cooking} готовится ·{" "}
              {analytics.inProgress.ready} на выдачу
            </p>
          )}
        </div>
      )}

      {tab === "analytics" && analytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Заказы по часам">
            <BarChart data={hourlyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                }}
              />
              <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
          <ChartCard title="Выручка по часам">
            <BarChart data={hourlyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                }}
                formatter={(v) => [formatMoney(Number(v)), "Выручка"]}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
          <div className="rounded-xl border border-zinc-800 p-4 lg:col-span-2">
            <h3 className="mb-4 font-medium">Топ блюд</h3>
            <ul className="space-y-2">
              {analytics.topItems.map((item) => (
                <li
                  key={item.name}
                  className="flex justify-between text-sm text-zinc-400"
                >
                  <span>{item.name}</span>
                  <span>{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateStatus}
        />
      )}

      {closeSummary && shift && (
        <ShiftSummaryModal
          shiftId={shift.id}
          summary={closeSummary}
          onConfirm={confirmCloseShift}
          onCancel={() => setCloseSummary(null)}
        />
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 p-4">
      <h3 className="mb-4 font-medium">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
