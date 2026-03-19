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
      ? "border-down focus:border-down focus:ring-down/30"
      : "border-white/10 focus:border-text-secondary focus:ring-text-secondary/20";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm text-text-secondary font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        data-testid={testId}
        aria-invalid={resolvedVariant === "error"}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          "w-full bg-bg-secondary text-text-primary placeholder:text-text-secondary",
          "px-4 py-2.5 rounded-xl border outline-none",
          "transition-all duration-150",
          "focus:ring-2",
          borderClass,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-down">
          {error}
        </p>
      )}
    </div>
  );
}
