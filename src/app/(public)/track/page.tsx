"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/order/${code.trim().toUpperCase()}/track`);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.28em] text-amber-800">Pickup</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-stone-900">
        Код заказа
      </h1>
      <p className="mt-2 text-stone-600">Пять символов с экрана подтверждения</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="VF5DR"
          className="w-full border border-stone-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.35em]"
        />
        <button
          type="submit"
          className="w-full bg-stone-900 py-3 font-medium text-white"
        >
          Найти
        </button>
      </form>
    </div>
  );
}
