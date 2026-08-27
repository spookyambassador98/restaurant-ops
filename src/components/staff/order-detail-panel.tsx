"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import type { OrderStatus, StaffOrder } from "@/lib/types/order";
import { ORDER_TYPE_LABELS } from "@/lib/types/order";
import { formatDateTime, formatMoney } from "@/lib/utils";

interface OrderEvent {
  id: string;
  fromStatusLabel: string | null;
  toStatusLabel: string;
  actorRole: string;
  actorName: string | null;
  createdAt: string;
}

export function OrderDetailPanel({
  order,
  onClose,
  onStatusChange,
}: {
  order: StaffOrder;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const [events, setEvents] = useState<OrderEvent[]>([]);

  useEffect(() => {
    fetch(`/api/staff/orders/${order.id}/events`)
      .then((r) => r.json())
      .then(setEvents);
  }, [order.id]);

  const prepMinutes =
    order.acceptedAt && order.readyAt
      ? Math.round(
          (+new Date(order.readyAt) - +new Date(order.acceptedAt)) / 60000,
        )
      : null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <p className="font-mono text-lg font-bold text-amber-400">
              #{order.orderNumber}
            </p>
            <p className="text-xs text-zinc-500">{order.publicId}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <OrderStatusBadge status={order.status as OrderStatus} />
            <p className="mt-2 text-sm text-zinc-300">{order.customerName}</p>
            <p className="text-sm text-zinc-500">{order.customerPhone}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {ORDER_TYPE_LABELS[order.orderType]} ·{" "}
              {formatDateTime(order.createdAt)}
            </p>
            {order.deliveryAddress && (
              <p className="mt-1 text-sm text-zinc-400">{order.deliveryAddress}</p>
            )}
            {prepMinutes !== null && (
              <p className="mt-2 text-xs text-emerald-400">
                Время готовки: {prepMinutes} мин
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-zinc-400">Позиции</h3>
            <ul className="space-y-2">
              {order.items.map((i) => (
                <li
                  key={i.id}
                  className="flex justify-between text-sm text-zinc-300"
                >
                  <span>
                    {i.quantity}× {i.nameSnapshot}
                  </span>
                  <span>{formatMoney(i.priceCentsSnapshot * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-zinc-800 pt-3 font-semibold">
              <span>Итого</span>
              <span className="text-amber-400">{formatMoney(order.totalCents)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">
              {order.notes}
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">История статусов</h3>
            <ol className="relative space-y-4 border-l border-zinc-800 pl-4">
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <p className="text-sm font-medium text-zinc-200">
                    {e.fromStatusLabel
                      ? `${e.fromStatusLabel} → ${e.toStatusLabel}`
                      : e.toStatusLabel}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {e.actorName ?? e.actorRole} · {formatDateTime(e.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="border-t border-zinc-800 p-4 flex flex-wrap gap-2">
          {order.status === "NEW" && (
            <>
              <PanelAction onClick={() => onStatusChange(order.id, "ACCEPTED")}>
                Принять
              </PanelAction>
              <PanelAction
                danger
                onClick={() => onStatusChange(order.id, "REJECTED")}
              >
                Отклонить
              </PanelAction>
            </>
          )}
          {order.status === "READY" && (
            <PanelAction onClick={() => onStatusChange(order.id, "COMPLETED")}>
              Отметить выданным
            </PanelAction>
          )}
          {!["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status) && (
            <PanelAction
              danger
              onClick={() => onStatusChange(order.id, "CANCELLED")}
            >
              Отменить
            </PanelAction>
          )}
        </div>
      </aside>
    </>
  );
}

function PanelAction({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        danger
          ? "border border-red-500/30 text-red-300"
          : "bg-amber-500 text-zinc-950"
      }`}
    >
      {children}
    </button>
  );
}
