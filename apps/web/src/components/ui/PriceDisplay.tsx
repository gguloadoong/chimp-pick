import { type HTMLAttributes } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceDisplayProps extends HTMLAttributes<HTMLDivElement> {
  price: number;
  changeRate: number;
  currency?: string;
  "data-testid"?: string;
}

function formatPrice(price: number, currency: string): string {
  if (currency === "KRW") {
    return price.toLocaleString("ko-KR") + "원";
  }
  return price.toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

function formatChangeRate(rate: number): string {
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

export default function PriceDisplay({
  price,
  changeRate,
  currency = "KRW",
  className = "",
  "data-testid": testId,
  ...props
}: PriceDisplayProps) {
  const isUp = changeRate >= 0;
  const colorClass = isUp ? "text-up" : "text-down";

  return (
    <div
      data-testid={testId ?? "price-display"}
      aria-label={`현재가 ${formatPrice(price, currency)}, ${isUp ? "상승" : "하락"} ${formatChangeRate(changeRate)}`}
      className={["flex items-baseline gap-3 font-mono", className].join(" ")}
      {...props}
    >
      <span className="text-2xl font-semibold text-text-primary tabular-nums">
        {formatPrice(price, currency)}
      </span>
      <span
        className={[
          "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
          colorClass,
        ].join(" ")}
        aria-live="polite"
      >
        {isUp ? (
          <TrendingUp size={14} aria-hidden="true" />
        ) : (
          <TrendingDown size={14} aria-hidden="true" />
        )}
        {formatChangeRate(changeRate)}
      </span>
    </div>
  );
}
