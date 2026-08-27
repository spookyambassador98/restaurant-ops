export const KITCHEN_SLA_WARN_MS = 8 * 60 * 1000;
export const KITCHEN_SLA_LATE_MS = 12 * 60 * 1000;

export type TicketAgeLevel = "ok" | "warn" | "late";

export function ticketAgeMs(
  now: number,
  timestamps: {
    createdAt: string;
    acceptedAt?: string | null;
    cookingAt?: string | null;
    readyAt?: string | null;
    status: string;
  },
) {
  const start =
    timestamps.status === "READY" && timestamps.readyAt
      ? timestamps.readyAt
      : timestamps.status === "COOKING" && timestamps.cookingAt
        ? timestamps.cookingAt
        : timestamps.status === "ACCEPTED" && timestamps.acceptedAt
          ? timestamps.acceptedAt
          : timestamps.createdAt;
  return Math.max(0, now - new Date(start).getTime());
}

export function ticketAgeLevel(ms: number): TicketAgeLevel {
  if (ms >= KITCHEN_SLA_LATE_MS) return "late";
  if (ms >= KITCHEN_SLA_WARN_MS) return "warn";
  return "ok";
}

export function formatAge(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
