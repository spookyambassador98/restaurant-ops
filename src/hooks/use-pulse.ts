"use client";

import { useEffect, useRef, useState } from "react";

export function usePulse<T>(url: string | null, intervalMs = 1200) {
  const [data, setData] = useState<T | null>(null);
  const [live, setLive] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!url) return;
    const endpoint = url;

    async function tick() {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as T;
        if (mounted.current) {
          setData(json);
          setLive(true);
        }
      } catch {
        if (mounted.current) setLive(false);
      }
    }

    void tick();
    const id = setInterval(() => void tick(), intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [url, intervalMs]);

  return { data, live };
}
