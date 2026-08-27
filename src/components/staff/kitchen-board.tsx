"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Maximize2, Minimize2 } from "lucide-react";
import { EightySixRail, type EightySixItem } from "@/components/staff/eighty-six-rail";
import { useNow } from "@/hooks/use-now";
import { usePulse } from "@/hooks/use-pulse";
import {
  KITCHEN_COLUMN_LABELS,
  KITCHEN_COLUMNS,
  ORDER_TYPE_LABELS,
  type OrderStatus,
  type OrderType,
} from "@/lib/types/order";
import { formatAge, ticketAgeLevel, ticketAgeMs } from "@/lib/ops";

interface KitchenOrder {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  orderType: OrderType;
  notes: string | null;
  createdAt: string;
  acceptedAt: string | null;
  cookingAt: string | null;
  readyAt: string | null;
  items: { nameSnapshot: string; quantity: number; notes: string | null }[];
}

interface StaffPulse {
  shiftId: string | null;
  ordersRev: string;
  items: EightySixItem[];
}

function playNewOrderSound() {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([120, 60, 120, 60, 200]);
    }
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      osc2.connect(gain);
      osc2.frequency.value = 1180;
      osc2.start();
      osc2.stop(ctx.currentTime + 0.14);
    }, 140);
  } catch {
    // ignore
  }
}

export function KitchenBoard({
  shiftId,
  initialOrders,
}: {
  shiftId: string | null;
  initialOrders: KitchenOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const prevIds = useRef(new Set(initialOrders.map((o) => o.id)));
  const pulseUrl = shiftId ? `/api/staff/pulse?shiftId=${shiftId}` : "/api/staff/pulse";
  const { data: pulse } = usePulse<StaffPulse>(pulseUrl, 1200);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  async function reload() {
    if (!shiftId) return;
    const res = await fetch(`/api/staff/kitchen/board?shiftId=${shiftId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setOrders(data);
  }

  useEffect(() => {
    if (!pulse?.ordersRev) return;
    void reload();
  }, [pulse?.ordersRev, shiftId]);

  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id));
    for (const id of ids) {
      if (!prevIds.current.has(id)) playNewOrderSound();
    }
    prevIds.current = ids;
  }, [orders]);

  async function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );
    await fetch(`/api/staff/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await reload();
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const orderId = String(active.id);
    const targetColumn = String(over.id) as OrderStatus;
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === targetColumn) return;

    const expected: Partial<Record<OrderStatus, OrderStatus>> = {
      ACCEPTED: "COOKING",
      COOKING: "READY",
    };
    if (expected[order.status] === targetColumn) {
      await updateStatus(orderId, targetColumn);
    }
  }

  const activeOrder = orders.find((o) => o.id === activeId);
  const columns = focusMode ? (["COOKING"] as OrderStatus[]) : KITCHEN_COLUMNS;
  const lateCount = orders.filter((o) => {
    const ms = ticketAgeMs(Date.now(), o);
    return ticketAgeLevel(ms) === "late";
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Expo / KDS
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-zinc-50">
            Кухня
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            {orders.length} тикетов
            {lateCount > 0 ? ` · ${lateCount} просрочено` : ""}
          </p>
        </div>
        <button
          onClick={() => setFocusMode((f) => !f)}
          className="flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-1.5 text-xs uppercase tracking-wider text-zinc-400"
        >
          {focusMode ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" /> Все станции
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" /> Focus
            </>
          )}
        </button>
      </div>

      <EightySixRail items={pulse?.items ?? []} />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className={`grid gap-4 ${focusMode ? "mx-auto max-w-md grid-cols-1" : "lg:grid-cols-3"}`}
        >
          {columns.map((col) => {
            const colOrders = orders.filter((o) => o.status === col);
            return (
              <KanbanColumn key={col} id={col} count={colOrders.length}>
                {colOrders.map((order) => (
                  <DraggableOrderCard
                    key={order.id}
                    order={order}
                    onAdvance={(status) => updateStatus(order.id, status)}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
        <DragOverlay>
          {activeOrder ? <OrderCardContent order={activeOrder} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  id,
  count,
  children,
}: {
  id: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
          {KITCHEN_COLUMN_LABELS[id as OrderStatus]}
        </h2>
        <span className="font-mono text-xs text-zinc-500">{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[280px] space-y-3 rounded-lg p-1 transition ${
          isOver ? "bg-amber-500/5 ring-1 ring-amber-500/30" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function DraggableOrderCard({
  order,
  onAdvance,
}: {
  order: KitchenOrder;
  onAdvance: (status: OrderStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: order.id });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  const next: Partial<Record<OrderStatus, OrderStatus>> = {
    ACCEPTED: "COOKING",
    COOKING: "READY",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none ${isDragging ? "opacity-40" : ""}`}
    >
      <div {...listeners} {...attributes}>
        <OrderCardContent order={order} />
      </div>
      {next[order.status] && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdvance(next[order.status]!);
          }}
          className="mt-1.5 w-full rounded-md bg-amber-500 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-zinc-950"
        >
          {order.status === "ACCEPTED" ? "Start / bump" : "Bump · ready"}
        </button>
      )}
    </div>
  );
}

function OrderCardContent({
  order,
  dragging,
}: {
  order: KitchenOrder;
  dragging?: boolean;
}) {
  const now = useNow(1000);
  const age = ticketAgeMs(now, order);
  const level = ticketAgeLevel(age);

  return (
    <article
      className={`rounded-lg border bg-zinc-950 p-4 ${
        dragging ? "ring-2 ring-amber-400" : ""
      } ${
        level === "late"
          ? "border-red-500/70 bg-red-950/40"
          : level === "warn"
            ? "border-amber-500/50"
            : "border-zinc-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-4xl font-bold leading-none text-amber-400">
          {order.orderNumber}
        </span>
        <span
          className={`font-mono text-sm tabular-nums ${
            level === "late"
              ? "text-red-400"
              : level === "warn"
                ? "text-amber-300"
                : "text-zinc-500"
          }`}
        >
          {formatAge(age)}
        </span>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {ORDER_TYPE_LABELS[order.orderType]}
        {level === "late" ? " · LATE" : ""}
      </p>
      <ul className="mt-3 space-y-1">
        {order.items.map((item, i) => (
          <li key={i} className="text-sm font-medium text-zinc-100">
            <span className="font-mono text-amber-400">{item.quantity}×</span>{" "}
            {item.nameSnapshot}
            {item.notes ? (
              <span className="block text-xs font-normal text-amber-200/80">
                {item.notes}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="mt-3 border-l-2 border-amber-500 pl-2 text-xs text-amber-200">
          {order.notes}
        </p>
      )}
    </article>
  );
}
