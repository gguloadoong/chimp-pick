"use client";

import { useEffect, useRef, useState } from "react";

interface BananaCounterProps {
  balance: number;
  "data-testid"?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const ANIMATION_DURATION_MS = 600;

export default function BananaCounter({
  balance,
  "data-testid": testId,
}: BananaCounterProps) {
  const [displayValue, setDisplayValue] = useState(balance);
  const prevBalanceRef = useRef(balance);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevBalanceRef.current;
    const to = balance;
    if (from === to) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      const easedProgress = easeOutCubic(progress);
      const current = Math.round(from + (to - from) * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevBalanceRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [balance]);

  return (
    <div
      data-testid={testId ?? "banana-counter"}
      aria-label={`바나나코인 잔액: ${balance.toLocaleString()}`}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-white border-2 border-card-border clay-sm",
        "font-mono font-bold text-banana",
      ].join(" ")}
    >
      <span aria-hidden="true" role="img" className="text-base leading-none">
        🍌
      </span>
      <span className="tabular-nums text-sm">{displayValue.toLocaleString()}</span>
    </div>
  );
}
