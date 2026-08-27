export type OrderStatus =
  | "NEW"
  | "ACCEPTED"
  | "COOKING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type StaffRole = "MANAGER" | "KITCHEN" | "ADMIN";

export type OrderType = "PICKUP" | "DELIVERY";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  ACCEPTED: "Принят",
  COOKING: "Готовится",
  READY: "Готов",
  COMPLETED: "Выдан",
  CANCELLED: "Отменён",
  REJECTED: "Отклонён",
};

export const CLIENT_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Заказ получен",
  ACCEPTED: "Подтверждён",
  COOKING: "Готовим ваш заказ",
  READY: "Готов к выдаче",
  COMPLETED: "Выдан",
  CANCELLED: "Отменён",
  REJECTED: "Отменён",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  PICKUP: "Самовывоз",
  DELIVERY: "Доставка",
};

export const CLIENT_TRACK_STEP_LABELS: Record<string, string> = {
  received: "Заказ получен",
  confirmed: "Подтверждён",
  preparing: "Готовим ваш заказ",
  ready: "Готов к выдаче",
  completed: "Выдан",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ACCEPTED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  COOKING: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  READY: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  COMPLETED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const KITCHEN_COLUMNS: OrderStatus[] = ["ACCEPTED", "COOKING", "READY"];

export const KITCHEN_COLUMN_LABELS: Record<string, string> = {
  ACCEPTED: "Принят",
  COOKING: "Готовится",
  READY: "На выдачу",
};

export const CLIENT_TRACK_STEPS = [
  { key: "received", statuses: ["NEW"] as OrderStatus[] },
  { key: "confirmed", statuses: ["ACCEPTED"] as OrderStatus[] },
  { key: "preparing", statuses: ["COOKING"] as OrderStatus[] },
  { key: "ready", statuses: ["READY"] as OrderStatus[] },
  { key: "completed", statuses: ["COMPLETED"] as OrderStatus[] },
] as const;

export interface CartItem {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
  notes?: string;
}

export interface PublicOrder {
  publicId: string;
  orderNumber: number;
  status: OrderStatus;
  customerName: string;
  orderType: OrderType;
  totalCents: number;
  notes: string | null;
  createdAt: string;
  etaMinutes: number | null;
  etaLabel: string;
  items: {
    nameSnapshot: string;
    quantity: number;
    priceCentsSnapshot: number;
  }[];
}

export interface StaffOrder extends PublicOrder {
  id: string;
  customerPhone: string;
  deliveryAddress: string | null;
  shiftId: string | null;
  acceptedAt: string | null;
  cookingAt: string | null;
  readyAt: string | null;
  items: {
    id: string;
    nameSnapshot: string;
    quantity: number;
    priceCentsSnapshot: number;
    notes: string | null;
  }[];
}

export const STAFF_TRANSITIONS: Record<
  OrderStatus,
  Partial<Record<OrderStatus, StaffRole[]>>
> = {
  NEW: { ACCEPTED: ["MANAGER", "ADMIN"], REJECTED: ["MANAGER", "ADMIN"], CANCELLED: ["MANAGER", "ADMIN"] },
  ACCEPTED: { COOKING: ["KITCHEN", "MANAGER", "ADMIN"], CANCELLED: ["MANAGER", "ADMIN"] },
  COOKING: { READY: ["KITCHEN", "MANAGER", "ADMIN"], CANCELLED: ["MANAGER", "ADMIN"] },
  READY: { COMPLETED: ["MANAGER", "ADMIN"], CANCELLED: ["MANAGER", "ADMIN"] },
  COMPLETED: {},
  CANCELLED: {},
  REJECTED: {},
};

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  role: StaffRole,
): boolean {
  return STAFF_TRANSITIONS[from]?.[to]?.includes(role) ?? false;
}

export function clientStepIndex(status: OrderStatus): number {
  if (status === "CANCELLED" || status === "REJECTED") return -1;
  for (let i = CLIENT_TRACK_STEPS.length - 1; i >= 0; i--) {
    if (CLIENT_TRACK_STEPS[i].statuses.includes(status)) return i;
    if (status === "COMPLETED") return CLIENT_TRACK_STEPS.length - 1;
  }
  return 0;
}
