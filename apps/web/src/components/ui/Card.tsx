import { type HTMLAttributes, type ReactNode } from "react";

type CardVariant = "default" | "elevated" | "outlined" | "status";
type CardStatus = "positive" | "negative" | "warning" | "info";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  status?: CardStatus;
  interactive?: boolean;
  "data-testid"?: string;
}

const statusClasses: Record<CardStatus, string> = {
  positive: "bg-[var(--positive-bg)] border-[var(--positive)]/30",
  negative: "bg-[var(--negative-bg)] border-[var(--negative)]/30",
  warning:  "bg-[var(--warning-bg)] border-[var(--warning)]/30",
  info:     "bg-[var(--info-bg)] border-[var(--info)]/30",
};

export default function Card({
  children,
  variant = "default",
  status,
  interactive = false,
  className = "",
  "data-testid": testId,
  ...props
}: CardProps) {
  const base = "rounded-[var(--radius-md)] p-4";

  const variantClass =
    variant === "elevated"
      ? "bg-[var(--bg-secondary)] shadow-[var(--shadow-2)]"
      : variant === "outlined"
      ? "bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
      : variant === "status" && status
      ? `border ${statusClasses[status]}`
      : "bg-[var(--bg-secondary)] shadow-[var(--shadow-1)]";

  const interactiveClass = interactive
    ? "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)] cursor-pointer"
    : "";

  return (
    <div
      data-testid={testId}
      className={[base, variantClass, interactiveClass, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
