import { type HTMLAttributes, type ReactNode } from "react";

type BadgeVariant = "neutral" | "brand" | "positive" | "negative" | "warning" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral:  "bg-[var(--bg-tertiary)] text-[var(--fg-secondary)]",
  brand:    "bg-[var(--brand-secondary)] text-[var(--brand-primary)]",
  positive: "bg-[var(--positive-bg)] text-[var(--positive)]",
  negative: "bg-[var(--negative-bg)] text-[var(--negative)]",
  warning:  "bg-[var(--warning-bg)] text-[var(--warning)]",
  info:     "bg-[var(--info-bg)] text-[var(--info)]",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-5 px-1.5 text-[12px]",
  md: "h-6 px-2 text-[13px]",
};

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-semibold leading-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
