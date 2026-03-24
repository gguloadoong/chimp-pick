"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "positive" | "negative" | "secondary" | "ghost" | "outline" | "up" | "down";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
  "data-testid"?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-primary)] text-[var(--brand-on-primary)] hover:brightness-105",
  positive:
    "bg-[var(--positive)] text-[var(--fg-inverse)] hover:bg-[var(--positive-hover)]",
  negative:
    "bg-[var(--negative)] text-[var(--fg-inverse)] hover:bg-[var(--negative-hover)]",
  secondary:
    "bg-[var(--bg-tertiary)] text-[var(--fg-primary)] hover:bg-[var(--border-primary)]",
  ghost:
    "bg-transparent text-[var(--fg-primary)] hover:bg-[var(--interactive-hover)]",
  outline:
    "bg-transparent border border-[var(--border-primary)] text-[var(--fg-primary)] hover:border-[var(--border-focus)] hover:bg-[var(--interactive-hover)]",
  // Legacy aliases
  up: "bg-[var(--positive)] text-[var(--fg-inverse)] hover:bg-[var(--positive-hover)]",
  down: "bg-[var(--negative)] text-[var(--fg-inverse)] hover:bg-[var(--negative-hover)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[var(--radius-sm)]",
  md: "h-10 px-4 text-[14px] rounded-[var(--radius-md)]",
  lg: "h-12 px-6 text-[14px] rounded-[var(--radius-md)]",
  xl: "h-14 px-8 text-[16px] rounded-[var(--radius-md)]",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  "data-testid": testId,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      data-testid={testId}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2 font-sans font-semibold",
        "transition-all duration-150 cursor-pointer select-none btn-press",
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <Loader2
          className="animate-spin"
          size={size === "sm" ? 14 : size === "xl" ? 20 : 16}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
