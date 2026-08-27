"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LayoutDashboard, LogOut, Shield } from "lucide-react";
import type { StaffRole } from "@/lib/types/order";

export function StaffSidebar({ role }: { role: StaffRole | null }) {
  const pathname = usePathname();

  const links = [
    ...(role === "ADMIN"
      ? [{ href: "/staff/admin", label: "Админ", icon: Shield }]
      : []),
    ...(role === "MANAGER" || role === "ADMIN"
      ? [{ href: "/staff/manager", label: "Менеджер", icon: LayoutDashboard }]
      : []),
    ...(role === "KITCHEN" || role === "MANAGER" || role === "ADMIN"
      ? [{ href: "/staff/kitchen", label: "Кухня", icon: ChefHat }]
      : []),
  ];

  async function logout() {
    await fetch("/api/staff/logout", { method: "POST" });
    window.location.href = "/staff/login";
  }

  return (
    <aside className="flex w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-5">
        <p className="text-xs uppercase tracking-wider text-zinc-500">Ops Portal</p>
        <p className="font-semibold text-zinc-100">Ember Kitchen</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              pathname.startsWith(href)
                ? "bg-zinc-800 text-amber-400"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={logout}
        className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
      >
        <LogOut className="h-4 w-4" />
        Выйти
      </button>
    </aside>
  );
}
