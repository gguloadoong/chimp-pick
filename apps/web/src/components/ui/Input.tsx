"use client";

import { type InputHTMLAttributes, useId } from "react";

type InputVariant = "default" | "error";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: InputVariant;
  "data-testid"?: string;
}

export default function Input({
  label,
  error,
  variant,
  className = "",
  "data-testid": testId,
  id: externalId,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const resolvedVariant: InputVariant = error ? "error" : (variant ?? "default");

  const borderClass =
    resolvedVariant === "error"
      ? "border-[var(--negative)] focus:border-[var(--negative)] focus:shadow-[var(--shadow-glow-negative)]"
      : "border-transparent hover:border-[var(--border-secondary)] focus:border-[var(--brand-primary)] focus:shadow-[var(--shadow-glow-brand)]";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-[13px] text-[var(--fg-secondary)] font-semibold font-sans">
          {label}
        </label>
      )}
      <input
        id={id}
        data-testid={testId}
        aria-invalid={resolvedVariant === "error"}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          "w-full h-10 bg-[var(--bg-tertiary)] text-[var(--fg-primary)]",
          "placeholder:text-[var(--fg-tertiary)] font-sans text-sm",
          "px-3 rounded-[var(--radius-md)] border outline-none",
          "transition-all duration-150",
          borderClass,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-[var(--negative)] font-sans">
          {error}
        </p>
      )}
    </div>
  );
}
