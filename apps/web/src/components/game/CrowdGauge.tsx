"use client";

interface CrowdGaugeProps {
  upPct: number;
  picked?: "UP" | "DOWN" | null;
  upScore?: number;
  downScore?: number;
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
      <circle cx={12} cy={8} r={5} />
      <circle cx={6} cy={6} r={2.5} />
      <circle cx={18} cy={6} r={2.5} />
      <ellipse cx={12} cy={17} rx={4} ry={6} />
      <rect x={7} y={14} width={3} height={6} rx={1.5} />
      <rect x={14} y={14} width={3} height={6} rx={1.5} />
    </svg>
  );
}

function getCrowdComment(upPct: number): string {
  const diff = Math.abs(upPct - 50);
  if (diff >= 40) return "🐑 완전 쏠렸다! 역배가 황금!";
  if (diff >= 30) return "⚡ 군중이 강하게 쏠리는 중!";
  if (diff >= 20) return "📊 한쪽으로 기울고 있어요";
  if (diff >= 10) return "🎲 팽팽한 대결!";
  return "⚖️ 완벽한 균형! 50:50 승부!";
}

export default function CrowdGauge({ upPct, picked, upScore, downScore }: CrowdGaugeProps) {
  const downPct = 100 - upPct;
  const upCount = Math.round((upPct / 100) * MONKEY_COUNT);
  const downCount = MONKEY_COUNT - upCount;
  const upIsMinority = upPct < 50;
  const downIsMinority = downPct < 50;

  return (
    <div className="rounded-[var(--radius-md)] py-3" data-testid="crowd-gauge">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--fg-secondary)] font-sans">군중 예측 분포</span>
        {(upIsMinority || downIsMinority) && (
          <span className="text-xs font-bold text-[var(--brand-primary)] font-sans animate-pulse">
            {upIsMinority ? "⬆️ UP 소수파 보너스!" : "⬇️ DOWN 소수파 보너스!"}
          </span>
        )}
      </div>

      <div className="relative flex h-14 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-primary)]">
        {/* UP side */}
        <div
          className={[
            "flex items-end justify-center gap-0.5 px-1 transition-all duration-700 relative",
            picked === "UP" ? "bg-[var(--positive)]/15" : "bg-[var(--positive)]/5",
          ].join(" ")}
          style={{ width: `${upPct}%` }}
        >
          <div className="flex items-end justify-center flex-wrap gap-0.5 text-[var(--positive)] pb-1">
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
          <span className="absolute bottom-0.5 left-1 text-xs font-bold text-[var(--positive)] font-sans">
            UP {upPct}%
          </span>
        </div>

        <div className="w-px bg-[var(--border-primary)] z-10" />

        {/* DOWN side */}
        <div
          className={[
            "flex items-end justify-center gap-0.5 px-1 transition-all duration-700 relative",
            picked === "DOWN" ? "bg-[var(--negative)]/15" : "bg-[var(--negative)]/5",
          ].join(" ")}
          style={{ width: `${downPct}%` }}
        >
          <div className="flex items-end justify-center flex-wrap gap-0.5 text-[var(--negative)] pb-1">
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
          <span className="absolute bottom-0.5 right-1 text-xs font-bold text-[var(--negative)] font-sans">
            DOWN {downPct}%
          </span>
        </div>
      </div>

      {/* Score display */}
      {(upScore !== undefined || downScore !== undefined) && (
        <div className="flex justify-between mt-2 px-1">
          <span className={["text-xs font-bold font-sans", upIsMinority ? "text-[var(--brand-primary)]" : "text-[var(--fg-tertiary)]"].join(" ")}>
            {upIsMinority ? `🔥 +${upScore}점` : `+${upScore}점`}
          </span>
          <span className={["text-xs font-bold font-sans", downIsMinority ? "text-[var(--brand-primary)]" : "text-[var(--fg-tertiary)]"].join(" ")}>
            {downIsMinority ? `🔥 +${downScore}점` : `+${downScore}점`}
          </span>
        </div>
      )}

      <p className="text-xs text-[var(--fg-tertiary)] text-center mt-1 font-sans">
        {getCrowdComment(upPct)}
      </p>
    </div>
  );
}
