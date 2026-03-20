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
    "bg-banana text-white font-bold border-2 border-banana/70 clay hover:brightness-105 active:scale-95",
  up: "bg-up text-white font-bold border-2 border-up/70 clay-up hover:brightness-105 active:scale-95",
  down: "bg-down text-white font-bold border-2 border-down/70 clay-down hover:brightness-105 active:scale-95",
  ghost:
    "bg-transparent text-text-primary hover:bg-banana/8 active:scale-95",
  outline:
    "bg-white border-2 border-card-border text-text-primary hover:border-banana/40 hover:bg-banana/5 clay-sm active:scale-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-base rounded-2xl",
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
        "inline-flex items-center justify-center gap-2 font-sans transition-all duration-150 cursor-pointer select-none btn-clay",
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
        <Loader2
          className="animate-spin"
          size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
