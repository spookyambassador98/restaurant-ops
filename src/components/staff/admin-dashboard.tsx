"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Plus, Trash2, Users, UtensilsCrossed, BarChart3 } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { StaffRole } from "@/lib/types/order";

type Tab = "menu" | "staff" | "reports";

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  items: MenuItem[];
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
}

interface ShiftReport {
  id: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
  openedBy: string;
  totalOrders: number;
  completedOrders: number;
  revenueFormatted: string;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  MANAGER: "Менеджер",
  KITCHEN: "Кухня",
  ADMIN: "Админ",
};

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("menu");
  const [categories, setCategories] = useState<Category[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [reports, setReports] = useState<ShiftReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemForm, setItemForm] = useState<{ categoryId: string; item?: MenuItem } | null>(null);
  const [catForm, setCatForm] = useState(false);
  const [staffForm, setStaffForm] = useState(false);

  const loadMenu = useCallback(async () => {
    const res = await fetch("/api/staff/admin/categories");
    if (res.ok) setCategories(await res.json());
  }, []);
  const loadStaff = useCallback(async () => {
    const res = await fetch("/api/staff/admin/staff");
    if (res.ok) setStaff(await res.json());
  }, []);
  const loadReports = useCallback(async () => {
    const res = await fetch("/api/staff/admin/reports/shifts");
    if (res.ok) setReports(await res.json());
  }, []);

  useEffect(() => {
    void Promise.all([loadMenu(), loadStaff(), loadReports()]).finally(() =>
      setLoading(false),
    );
  }, [loadMenu, loadStaff, loadReports]);

  async function toggleAvailability(item: MenuItem) {
    await fetch(`/api/staff/eighty-six/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    await loadMenu();
  }

  async function deleteMenuItem(item: MenuItem) {
    if (!confirm(`Снять «${item.name}» с витрины насовсем?`)) return;
    await fetch(`/api/staff/admin/menu-items/${item.id}`, { method: "DELETE" });
    await loadMenu();
  }

  async function toggleStaffActive(user: StaffUser) {
    await fetch(`/api/staff/admin/staff/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    await loadStaff();
  }

  if (loading) return <p className="text-zinc-500">Загрузка...</p>;

  const tabs: { id: Tab; label: string; icon: typeof UtensilsCrossed }[] = [
    { id: "menu", label: "Меню", icon: UtensilsCrossed },
    { id: "staff", label: "Сотрудники", icon: Users },
    { id: "reports", label: "Смены", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Owner</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-zinc-50">
          Управление
        </h1>
      </div>

      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm ${
              tab === id ? "bg-zinc-900 text-amber-400" : "text-zinc-400"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "menu" && (
        <div className="space-y-6">
          <button
            onClick={() => setCatForm(true)}
            className="flex items-center gap-2 bg-zinc-900 px-4 py-2 text-sm ring-1 ring-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Категория
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="border border-zinc-800 bg-zinc-950 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{cat.name}</h2>
                  <p className="text-xs text-zinc-500">{cat.slug}</p>
                </div>
                <button
                  onClick={() => setItemForm({ categoryId: cat.id })}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-amber-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Блюдо
                </button>
              </div>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-zinc-900 px-3 py-2"
                  >
                    <div>
                      <p className={`font-medium ${!item.isAvailable ? "text-zinc-500 line-through" : ""}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatMoney(item.priceCents)}
                        {!item.isAvailable && " · 86"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void toggleAvailability(item)}
                        className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
                        title="86"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setItemForm({ categoryId: cat.id, item })}
                        className="text-xs text-zinc-400"
                      >
                        Правка
                      </button>
                      <button
                        onClick={() => void deleteMenuItem(item)}
                        className="p-1 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "staff" && (
        <div className="space-y-4">
          <button
            onClick={() => setStaffForm(true)}
            className="flex items-center gap-2 bg-zinc-900 px-4 py-2 text-sm ring-1 ring-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Сотрудник
          </button>
          <div className="overflow-hidden border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left">Имя</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Роль</th>
                  <th className="px-4 py-3 text-left">Статус</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {staff.map((user) => (
                  <tr key={user.id} className="border-t border-zinc-800">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                    <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                    <td className="px-4 py-3">
                      <span className={user.isActive ? "text-emerald-400" : "text-zinc-500"}>
                        {user.isActive ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => void toggleStaffActive(user)}
                        className="text-xs text-zinc-400 hover:text-amber-400"
                      >
                        {user.isActive ? "Деактивировать" : "Активировать"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="overflow-hidden border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left">Смена</th>
                <th className="px-4 py-3 text-left">Открыл</th>
                <th className="px-4 py-3 text-left">Заказы</th>
                <th className="px-4 py-3 text-left">Выручка</th>
                <th className="px-4 py-3 text-left">Z-отчёт</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3">
                    {new Date(r.openedAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{r.openedBy}</td>
                  <td className="px-4 py-3">
                    {r.completedOrders}/{r.totalOrders}
                  </td>
                  <td className="px-4 py-3 text-amber-400">{r.revenueFormatted}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`/staff/z-report/${r.id}`}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Печать
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {itemForm && (
        <ItemModal
          categoryId={itemForm.categoryId}
          item={itemForm.item}
          onClose={() => setItemForm(null)}
          onSaved={() => {
            setItemForm(null);
            void loadMenu();
          }}
        />
      )}
      {catForm && (
        <CategoryModal
          onClose={() => setCatForm(false)}
          onSaved={() => {
            setCatForm(false);
            void loadMenu();
          }}
        />
      )}
      {staffForm && (
        <StaffModal
          onClose={() => setStaffForm(false)}
          onSaved={() => {
            setStaffForm(false);
            void loadStaff();
          }}
        />
      )}
    </div>
  );
}

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 border border-zinc-800 bg-zinc-950 p-5">
        {children}
      </div>
    </>
  );
}

function ItemModal({
  categoryId,
  item,
  onClose,
  onSaved,
}: {
  categoryId: string;
  item?: MenuItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.priceCents / 100) : "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(price || "0") * 100);
    if (!name.trim() || !priceCents) return;
    setSaving(true);
    if (item) {
      await fetch(`/api/staff/admin/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, priceCents, imageUrl }),
      });
    } else {
      await fetch("/api/staff/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, name, description, priceCents, imageUrl }),
      });
    }
    setSaving(false);
    onSaved();
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold">{item ? "Правка блюда" : "Новое блюдо"}</h2>
      <form onSubmit={save} className="space-y-3">
        <ModalField label="Название" value={name} onChange={setName} />
        <ModalField label="Описание" value={description} onChange={setDescription} />
        <ModalField label="Цена, ₽" value={price} onChange={setPrice} />
        <ModalField label="URL фото" value={imageUrl} onChange={setImageUrl} />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-zinc-800 py-2 text-sm">
            Отмена
          </button>
          <button type="submit" disabled={saving} className="flex-1 bg-amber-500 py-2 text-sm font-medium text-zinc-950">
            Сохранить
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function CategoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const nextSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, "-");
    await fetch("/api/staff/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: nextSlug }),
    });
    onSaved();
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold">Категория</h2>
      <form onSubmit={save} className="space-y-3">
        <ModalField label="Название" value={name} onChange={setName} />
        <ModalField label="Slug" value={slug} onChange={setSlug} />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-zinc-800 py-2 text-sm">
            Отмена
          </button>
          <button type="submit" className="flex-1 bg-amber-500 py-2 text-sm font-medium text-zinc-950">
            Создать
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function StaffModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<StaffRole>("MANAGER");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/staff/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, pin, role }),
    });
    onSaved();
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold">Сотрудник</h2>
      <form onSubmit={save} className="space-y-3">
        <ModalField label="Имя" value={name} onChange={setName} />
        <ModalField label="Email" value={email} onChange={setEmail} />
        <ModalField label="PIN" value={pin} onChange={setPin} />
        <label className="block text-xs text-zinc-500">
          Роль
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="mt-1 w-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="MANAGER">Менеджер</option>
            <option value="KITCHEN">Кухня</option>
            <option value="ADMIN">Админ</option>
          </select>
        </label>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-zinc-800 py-2 text-sm">
            Отмена
          </button>
          <button type="submit" className="flex-1 bg-amber-500 py-2 text-sm font-medium text-zinc-950">
            Создать
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function ModalField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs text-zinc-500">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
      />
    </label>
  );
}
