"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const DEMOS = [
  { email: "manager@ember.local", pin: "1234", label: "Менеджер" },
  { email: "kitchen@ember.local", pin: "5678", label: "Кухня" },
  { email: "admin@ember.local", pin: "9999", label: "Админ" },
];

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Неверный логин или PIN");
      router.push(data.redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <p className="text-center text-[10px] uppercase tracking-[0.28em] text-zinc-500">
          Ops console
        </p>
        <h1 className="mt-3 text-center font-[family-name:var(--font-display)] text-3xl text-zinc-50">
          Ember Kitchen
        </h1>
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 border border-zinc-800 bg-zinc-900/80 p-6"
        >
          <label className="block text-xs text-zinc-500">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="block text-xs text-zinc-500">
            PIN
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              className="mt-1 w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-amber-500 py-2.5 text-sm font-medium text-zinc-950"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Войти
          </button>
        </form>
        <div className="mt-6 space-y-2">
          <p className="text-center text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            Демо-вход
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPin(d.pin);
                }}
                className="border border-zinc-800 px-2 py-2 text-[11px] text-zinc-400 hover:text-amber-400"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
