"use client";

import { useEffect, useState } from "react";
import { Loader2, Phone } from "lucide-react";
import { ThermalReceipt } from "@/components/public/thermal-receipt";
import {
  CLIENT_STATUS_LABELS,
  CLIENT_TRACK_STEP_LABELS,
  CLIENT_TRACK_STEPS,
  ORDER_TYPE_LABELS,
  clientStepIndex,
  type OrderStatus,
  type OrderType,
  type PublicOrder,
} from "@/lib/types/order";
import { usePulse } from "@/hooks/use-pulse";

export default function OrderTrackPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const [publicId, setPublicId] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const pulse = usePulse<{ stamp: string }>(publicId ? "/api/public/pulse" : null, 1200);

  useEffect(() => {
    params.then((p) => setPublicId(p.publicId.toUpperCase()));
  }, [params]);

  useEffect(() => {
    if (!publicId) return;

    async function load() {
      const res = await fetch(`/api/public/orders/${publicId}`, { cache: "no-store" });
      if (res.ok) setOrder(await res.json());
      setLoading(false);
    }

    void load();
    const poll = setInterval(() => void load(), 1200);
    return () => clearInterval(poll);
  }, [publicId, pulse.data?.stamp]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-stone-500">Заказ не найден</p>
      </div>
    );
  }

  const status = order.status as OrderStatus;
  const stepIdx = clientStepIndex(status);
  const cancelled = status === "CANCELLED" || status === "REJECTED";
  const ready = status === "READY";
  const done = status === "COMPLETED";

  if (ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="rounded-sm bg-stone-950 px-6 py-16 text-center text-stone-50">
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-400">
            Можно забирать
          </p>
          <p className="mt-6 font-mono text-7xl font-bold tracking-widest text-amber-400">
            {order.publicId}
          </p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-3xl">
            Заказ №{order.orderNumber}
          </p>
          <p className="mt-3 text-sm text-stone-400">Покажите код на выдаче</p>
        </div>
        <div className="mt-8">
          <ThermalReceipt
            publicId={order.publicId}
            orderNumber={order.orderNumber}
            items={order.items}
            totalCents={order.totalCents}
            notes={order.notes}
            orderType={ORDER_TYPE_LABELS[order.orderType as OrderType]}
            createdAt={order.createdAt}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-amber-800">
        {done ? "Выдан" : "Статус заказа"}
      </p>
      <p className="mt-3 font-mono text-5xl font-bold tracking-[0.18em] text-stone-900">
        {order.publicId}
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl">
        Заказ №{order.orderNumber}
      </h1>
      <p className="mt-1 text-stone-600">{CLIENT_STATUS_LABELS[status]}</p>

      {!cancelled && order.etaLabel && !done && (
        <div className="mt-5 border border-stone-200 bg-white px-4 py-3 text-sm">
          <span className="font-medium">ETA · </span>
          {order.etaLabel}
        </div>
      )}

      {!cancelled && !done && (
        <div className="mt-8 space-y-4">
          {CLIENT_TRACK_STEPS.map((step, i) => {
            const isDone = stepIdx >= i;
            const active = stepIdx === i;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center text-xs font-semibold ${
                    isDone ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-400"
                  } ${active ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
                >
                  {i + 1}
                </div>
                <span className={isDone ? "text-stone-800" : "text-stone-400"}>
                  {CLIENT_TRACK_STEP_LABELS[step.key]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {cancelled && (
        <p className="mt-6 border border-red-200 bg-red-50 p-4 text-red-800">
          Этот заказ отменён.
        </p>
      )}

      <div className="mt-10">
        <ThermalReceipt
          publicId={order.publicId}
          orderNumber={order.orderNumber}
          items={order.items}
          totalCents={order.totalCents}
          notes={order.notes}
          orderType={ORDER_TYPE_LABELS[order.orderType as OrderType]}
          createdAt={order.createdAt}
        />
      </div>

      <a
        href="tel:+74951234567"
        className="mt-8 flex items-center justify-center gap-2 text-sm text-stone-600"
      >
        <Phone className="h-4 w-4" />
        Ресепшн · +7 495 123-45-67
      </a>
    </div>
  );
}
