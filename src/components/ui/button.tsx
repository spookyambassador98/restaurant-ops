import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20":
            variant === "primary",
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700":
            variant === "secondary",
          "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50":
            variant === "ghost",
          "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30":
            variant === "danger",
          "border border-zinc-700 text-zinc-300 hover:bg-zinc-800/50":
            variant === "outline",
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}
