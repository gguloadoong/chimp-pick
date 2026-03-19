"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "up" | "down" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
  "data-testid"?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-banana text-bg-primary font-semibold hover:shadow-[var(--glow-banana)] active:scale-95",
  up: "bg-up text-bg-primary font-semibold hover:shadow-[var(--glow-up)] active:scale-95",
  down: "bg-down text-white font-semibold hover:shadow-[var(--glow-down)] active:scale-95",
  ghost:
    "bg-transparent text-text-primary hover:bg-white/10 active:scale-95",
  outline:
    "bg-transparent border border-text-secondary text-text-primary hover:border-text-primary hover:bg-white/5 active:scale-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-7 py-3.5 text-lg rounded-2xl",
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
        "inline-flex items-center justify-center gap-2 font-sans transition-all duration-150 cursor-pointer select-none",
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin" size={size === "sm" ? 14 : size === "lg" ? 20 : 16} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
