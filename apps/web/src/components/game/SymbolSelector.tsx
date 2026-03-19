"use client";

import type { SymbolInfo, PriceData } from "@/types";
import { formatCompact } from "@/lib/format";

const SYMBOL_EMOJI: Record<string, string> = {
  "BTC-KRW": "₿",
  "ETH-KRW": "Ξ",
  "DOGE-KRW": "🐶",
  "SHIB-KRW": "🐕",
  "XRP-KRW": "✕",
  "005930": "📱",
  "000660": "💾",
  "035420": "🔍",
  "035720": "💬",
  "068270": "💊",
};

interface SymbolSelectorProps {
  symbols: SymbolInfo[];
  selected: SymbolInfo;
  priceMap: Record<string, PriceData>;
  onSelect: (symbol: SymbolInfo) => void;
  "data-testid"?: string;
}

export default function SymbolSelector({
  symbols,
  selected,
  priceMap,
  onSelect,
  "data-testid": testId,
}: SymbolSelectorProps) {
  return (
    <div
      data-testid={testId ?? "symbol-selector"}
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      style={{ scrollbarWidth: "none" }}
      role="listbox"
      aria-label="종목 선택"
    >
      {symbols.map((sym) => {
        const isActive = sym.symbol === selected.symbol;
        const price = priceMap[sym.symbol];
        const emoji = SYMBOL_EMOJI[sym.symbol] ?? "📈";
        const isUp = price ? price.change24h >= 0 : null;

        return (
          <button
            key={sym.symbol}
            role="option"
            aria-selected={isActive}
            data-testid={`symbol-pill-${sym.symbol}`}
            onClick={() => onSelect(sym)}
            className={[
              "flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl",
              "border transition-all duration-150 cursor-pointer select-none",
              "min-w-[72px]",
              isActive
                ? "border-banana bg-banana/10 shadow-[0_0_12px_rgba(255,184,0,0.2)]"
                : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10",
            ].join(" ")}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span
              className={[
                "text-[11px] font-medium leading-none",
                isActive ? "text-banana" : "text-text-primary",
              ].join(" ")}
            >
              {sym.nameKr}
            </span>
            {price ? (
              <span
                className={[
                  "text-[10px] leading-none tabular-nums",
                  isUp ? "text-up" : "text-down",
                ].join(" ")}
              >
                {formatCompact(price.price)}
              </span>
            ) : (
              <span className="text-[10px] text-text-secondary leading-none">-</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
