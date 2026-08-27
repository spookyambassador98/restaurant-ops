import type { OrderStatus } from "@/lib/types/order";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/types/order";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({
  status,
  variant = "staff",
  className,
}: {
  status: OrderStatus;
  variant?: "staff" | "client";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "staff" ? ORDER_STATUS_COLORS[status] : "border-stone-300 bg-stone-100 text-stone-700",
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
