import { type HTMLAttributes, type ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  "data-testid"?: string;
}

export default function Card({
  children,
  className = "",
  "data-testid": testId,
  ...props
}: CardProps) {
  return (
    <div
      data-testid={testId}
      className={[
        "bg-bg-secondary rounded-xl p-4",
        "shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
        "transition-transform duration-200 hover:-translate-y-0.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
