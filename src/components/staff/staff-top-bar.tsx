"use client";

import { usePulse } from "@/hooks/use-pulse";
import { formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";

export function StaffTopBar() {
  const [time, setTime] = useState("");
  const { data, live } = usePulse<{ kitchenOpen: boolean }>("/api/staff/pulse", 2000);

  useEffect(() => {
    const tick = () => setTime(formatTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const shiftOpen = data?.kitchenOpen ?? false;

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-6">
      <span className="font-mono text-sm text-zinc-400">{time}</span>
      <span
        className={`text-[11px] uppercase tracking-[0.16em] ${
          shiftOpen ? "text-emerald-400" : "text-zinc-500"
        }`}
      >
        {live ? (shiftOpen ? "Смена открыта" : "Смена закрыта") : "Нет связи"}
      </span>
    </header>
  );
}
