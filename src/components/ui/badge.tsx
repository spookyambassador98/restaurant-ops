import type { OrderStatus } from "@/lib/types/order";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/types/order";
import { cn } from "@/lib/utils";

export function Badge({
  status,
  className,
  children,
}: {
  status?: OrderStatus;
  className?: string;
  children?: React.ReactNode;
}) {
  if (status) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
          ORDER_STATUS_COLORS[status],
          className,
        )}
      >
        {ORDER_STATUS_LABELS[status]}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
