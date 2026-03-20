"use client";

interface MiniChartProps {
  prices: number[];
  className?: string;
  height?: number;
  "data-testid"?: string;
}

export default function MiniChart({
  prices,
  className = "",
  height = 80,
  "data-testid": testId,
}: MiniChartProps) {
  if (prices.length < 2) {
    return (
      <div
        data-testid={testId ?? "mini-chart"}
        className={["w-full bg-banana/8 rounded-xl border border-card-border", className].join(" ")}
        style={{ height }}
      />
    );
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const width = 300;
  const padX = 4;
  const padY = 8;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = prices.map((p, i) => {
    const x = padX + (i / (prices.length - 1)) * chartW;
    const y = padY + (1 - (p - min) / range) * chartH;
    return [x, y] as [number, number];
  });

  const isUp = prices[prices.length - 1] >= prices[0];
  const lineColor = isUp ? "#10B981" : "#F43F5E";
  const gradientId = `chart-grad-${isUp ? "up" : "down"}`;
  const gradientStartOpacity = isUp ? "0.25" : "0.2";

  const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");

  const areaPoints = [
    `${points[0][0]},${height}`,
    ...points.map(([x, y]) => `${x},${y}`),
    `${points[points.length - 1][0]},${height}`,
  ].join(" ");

  return (
    <div
      data-testid={testId ?? "mini-chart"}
      className={["w-full overflow-hidden rounded-xl", className].join(" ")}
      style={{ height }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={gradientStartOpacity} />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <polygon
          points={areaPoints}
          fill={`url(#${gradientId})`}
        />

        {/* Price line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Last price dot */}
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="3.5"
          fill={lineColor}
          opacity="1"
        />
        {/* Dot glow ring */}
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="6"
          fill={lineColor}
          opacity="0.2"
        />
      </svg>
    </div>
  );
}
