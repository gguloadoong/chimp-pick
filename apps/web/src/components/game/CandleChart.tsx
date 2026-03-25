"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  ColorType,
} from "lightweight-charts";
import { generateCandles, onPriceUpdate, getPrice } from "@/lib/game-engine";

interface CandleChartProps {
  symbol: string;
  timeframe: string;
  height?: number;
  className?: string;
}

export default function CandleChart({
  symbol,
  timeframe,
  height = 200,
  className = "",
}: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const candlesRef = useRef<CandlestickData[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(156,163,175,1)",
        fontFamily: "monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.2)" },
        horzLine: { color: "rgba(255,255,255,0.2)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: false,
      handleScale: false,
      width: containerRef.current.clientWidth,
      height,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#10B981",
      downColor: "#F43F5E",
      borderUpColor: "#10B981",
      borderDownColor: "#F43F5E",
      wickUpColor: "#10B981",
      wickDownColor: "#F43F5E",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const candles = generateCandles(symbol, timeframe, 50);
    const data: CandlestickData[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candlesRef.current = data;
    series.setData(data);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      candlesRef.current = []; // stale 콜백 방어 — candles.length === 0 가드가 차단
    };
  }, [symbol, timeframe, height]);

  useEffect(() => {
    const INTERVAL_SEC: Record<string, number> = {
      "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400,
    };
    const MAX_CANDLES = 100;

    const unsubscribe = onPriceUpdate(() => {
      const series = seriesRef.current;
      const candles = candlesRef.current;
      if (!series || candles.length === 0) return;

      const price = getPrice(symbol);
      const last = candles[candles.length - 1];
      const nowSec = Math.floor(Date.now() / 1000);
      const intervalSec = INTERVAL_SEC[timeframe] ?? 60;

      if (nowSec - (last.time as number) < intervalSec) {
        // 같은 봉 — 업데이트
        const updated: CandlestickData = {
          time: last.time,
          open: last.open,
          high: Math.max(last.high, price.price),
          low: Math.min(last.low, price.price),
          close: price.price,
        };
        candlesRef.current[candles.length - 1] = updated;
        series.update(updated);
      } else {
        // 새 봉
        const candleTime = (Math.floor(nowSec / intervalSec) * intervalSec) as Time;
        const newCandle: CandlestickData = {
          time: candleTime,
          open: price.price,
          high: price.price,
          low: price.price,
          close: price.price,
        };
        const next = [...candles, newCandle].slice(-MAX_CANDLES);
        candlesRef.current = next;
        if (next.length < candles.length + 1) {
          // 트리밍 발생 — 전체 다시 세팅
          series.setData(next);
        } else {
          series.update(newCandle);
        }
      }
    });
    return unsubscribe;
  }, [symbol, timeframe]);

  return (
    <div
      ref={containerRef}
      className={["w-full rounded-xl overflow-hidden", className].join(" ")}
      style={{ height }}
      data-testid="candle-chart"
    />
  );
}
