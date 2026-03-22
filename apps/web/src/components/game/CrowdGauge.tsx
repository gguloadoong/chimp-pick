"use client";

/**
 * CrowdGauge — 원숭이 군중이 UP/DOWN으로 우르르 몰리는 비주얼
 * 비율에 따라 원숭이 실루엣이 좌우로 분포
 */

interface CrowdGaugeProps {
  upPct: number;
  picked?: "UP" | "DOWN" | null;
}

const MONKEY_COUNT = 12;

function MonkeySilhouette({ flip, delay, size }: { flip: boolean; delay: number; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="transition-all duration-500"
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Simple chimp silhouette */}
      <circle cx={12} cy={8} r={5} />
      <circle cx={6} cy={6} r={2.5} />
      <circle cx={18} cy={6} r={2.5} />
      <ellipse cx={12} cy={17} rx={4} ry={6} />
      <rect x={7} y={14} width={3} height={6} rx={1.5} />
      <rect x={14} y={14} width={3} height={6} rx={1.5} />
    </svg>
  );
}

export default function CrowdGauge({ upPct, picked }: CrowdGaugeProps) {
  const downPct = 100 - upPct;
  const upCount = Math.round((upPct / 100) * MONKEY_COUNT);
  const downCount = MONKEY_COUNT - upCount;
  const upIsMinority = upPct < 50;
  const downIsMinority = downPct < 50;

  return (
    <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay" data-testid="crowd-gauge">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-secondary font-sans">참여 현황</span>
        {(upIsMinority || downIsMinority) && (
          <span className="text-xs font-bold text-banana font-sans animate-pulse">
            {upIsMinority ? "⬆️ UP 소수파 보너스!" : "⬇️ DOWN 소수파 보너스!"}
          </span>
        )}
      </div>

      {/* Crowd visualization */}
      <div className="relative flex h-16 rounded-2xl overflow-hidden border-2 border-card-border bg-bg-primary">
        {/* UP side */}
        <div
          className={[
            "flex items-end justify-center gap-0.5 px-1 transition-all duration-700 relative",
            picked === "UP" ? "bg-up/15" : "bg-up/5",
          ].join(" ")}
          style={{ width: `${upPct}%` }}
        >
          <div className="flex items-end justify-center flex-wrap gap-0.5 text-up pb-1">
            {Array.from({ length: upCount }, (_, i) => (
              <div
                key={`up-${i}`}
                className="animate-bounce"
                style={{ animationDelay: `${i * 0.12}s`, animationDuration: `${0.8 + (i % 4) * 0.1}s` }}
              >
                <MonkeySilhouette flip={false} delay={i * 0.1} size={upCount > 8 ? 14 : 18} />
              </div>
            ))}
          </div>
          <span className="absolute bottom-0.5 left-1 text-xs font-bold text-up font-sans">
            UP {upPct}%
          </span>
        </div>

        {/* Divider */}
        <div className="w-0.5 bg-card-border z-10" />

        {/* DOWN side */}
        <div
          className={[
            "flex items-end justify-center gap-0.5 px-1 transition-all duration-700 relative",
            picked === "DOWN" ? "bg-down/15" : "bg-down/5",
          ].join(" ")}
          style={{ width: `${downPct}%` }}
        >
          <div className="flex items-end justify-center flex-wrap gap-0.5 text-down pb-1">
            {Array.from({ length: downCount }, (_, i) => (
              <div
                key={`down-${i}`}
                className="animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: `${0.9 + (i % 3) * 0.1}s` }}
              >
                <MonkeySilhouette flip={true} delay={i * 0.1} size={downCount > 8 ? 14 : 18} />
              </div>
            ))}
          </div>
          <span className="absolute bottom-0.5 right-1 text-xs font-bold text-down font-sans">
            DOWN {downPct}%
          </span>
        </div>
      </div>

      <p className="text-xs text-text-secondary text-center mt-2 font-sans">
        🐵 원숭이가 적은 쪽을 맞추면 더 높은 점수!
      </p>
    </div>
  );
}
