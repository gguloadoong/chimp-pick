"use client";

import { Banana } from "lucide-react";

interface BetSliderProps {
  value: number;
  min?: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function BetSlider({
  value,
  min = 10,
  max,
  step = 10,
  onChange,
  disabled = false,
}: BetSliderProps) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--fg-secondary)] font-sans">베팅 금액</span>
        <div className="flex items-center gap-1 bg-[var(--brand-secondary)] px-2.5 py-1 rounded-[var(--radius-sm)]">
          <Banana size={12} className="text-[var(--brand-primary)]" />
          <span
            className="font-mono font-bold text-[var(--brand-primary)] tabular-nums text-sm"
            data-testid="bet-amount-display"
          >
            {value.toLocaleString()}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="베팅 금액"
        data-testid="bet-slider"
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background: `linear-gradient(to right, var(--brand-primary) ${pct}%, var(--bg-tertiary) ${pct}%)`,
        }}
      />

      <div className="flex justify-between text-xs text-[var(--fg-secondary)] font-mono">
        <span>{min}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
