"use client";

import { useState } from "react";
import { Ban } from "lucide-react";

export interface EightySixItem {
  id: string;
  name: string;
  isAvailable: boolean;
  category: string;
}

export function EightySixRail({
  items,
  onToggle,
}: {
  items: EightySixItem[];
  onToggle?: (id: string, isAvailable: boolean) => Promise<void> | void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const grouped = items.reduce<Record<string, EightySixItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  async function toggle(item: EightySixItem) {
    setBusy(item.id);
    try {
      if (onToggle) {
        await onToggle(item.id, !item.isAvailable);
      } else {
        await fetch(`/api/staff/eighty-six/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !item.isAvailable }),
        });
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/80">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <Ban className="h-4 w-4 text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-zinc-100">86 board</p>
          <p className="text-xs text-zinc-500">Снял — на витрине сразу серое</p>
        </div>
      </div>
      <div className="max-h-80 space-y-4 overflow-y-auto p-3">
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {cat}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {catItems.map((item) => (
                <button
                  key={item.id}
                  disabled={busy === item.id}
                  onClick={() => void toggle(item)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    item.isAvailable
                      ? "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:ring-amber-500/40"
                      : "bg-red-500/15 text-red-300 line-through ring-1 ring-red-500/30"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
