"use client";

interface Mission {
  type: "FIRST_PREDICT" | "THREE_PREDICTS" | "SHARE";
  isCompleted: boolean;
  reward: number;
}

export interface RetentionPanelProps {
  streak: number;
  maxStreak: number;
  missions: Mission[];
}

const MISSION_META: Record<
  Mission["type"],
  { label: string; defaultReward: number }
> = {
  FIRST_PREDICT: { label: "오늘 첫 예측 🎯", defaultReward: 5 },
  THREE_PREDICTS: { label: "예측 3회 완료 🔥", defaultReward: 10 },
  SHARE: { label: "결과 공유하기 📤", defaultReward: 15 },
};

export default function RetentionPanel({
  streak,
  maxStreak,
  missions,
}: RetentionPanelProps) {
  const safeStreak = Math.max(0, streak);
  const safeMaxStreak = Math.max(0, maxStreak);
  const completedCount = missions.filter((m) => m.isCompleted).length;

  return (
    <div className="bg-[var(--bg-secondary)] border-2 border-[rgba(255,255,255,0.08)] rounded-[var(--radius-md)] p-4 space-y-4">
      {/* 스트릭 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="pixel-font text-[10px] tracking-widest text-[var(--fg-tertiary)] uppercase">
              출석 스트릭
            </p>
            <p className="font-heading font-bold text-[var(--fg-primary)] text-sm leading-tight">
              {safeStreak}일째 연속 출석 중
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="pixel-font text-[9px] tracking-widest text-[var(--fg-tertiary)] uppercase mb-0.5">
            최고
          </p>
          <p className="font-mono font-bold text-[var(--brand-primary)] text-sm tabular-nums">
            {safeMaxStreak}일
          </p>
        </div>
      </div>

      {/* 스트릭 시각 바 — 최대 7칸 */}
      <div className="flex gap-1.5" role="img" aria-label={`스트릭 ${safeStreak}일`}>
        {Array.from({ length: 7 }).map((_, i) => {
          const active = i < Math.min(safeStreak, 7);
          return (
            <div
              key={i}
              className={[
                "flex-1 h-2 rounded-full transition-colors duration-300",
                active
                  ? "bg-[var(--brand-primary)]"
                  : "bg-[var(--bg-tertiary)]",
              ].join(" ")}
            />
          );
        })}
      </div>

      {/* 구분선 */}
      <div className="border-t border-[rgba(255,255,255,0.06)]" />

      {/* 미션 목록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[var(--fg-secondary)] font-sans">
            오늘의 미션
          </p>
          <p className="pixel-font text-[9px] tracking-widest text-[var(--fg-tertiary)]">
            {completedCount}/{missions.length} 완료
          </p>
        </div>

        <ul className="space-y-2" role="list">
          {missions.map((mission) => {
            const meta = MISSION_META[mission.type];
            return (
              <li
                key={mission.type}
                className={[
                  "flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-sm)] border transition-all duration-200",
                  mission.isCompleted
                    ? "bg-[var(--positive-bg)] border-[var(--positive)]/20 opacity-80"
                    : "bg-[var(--bg-primary)] border-[rgba(255,255,255,0.06)]",
                ].join(" ")}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={[
                      "w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs rounded-full border",
                      mission.isCompleted
                        ? "bg-[var(--positive)] border-[var(--positive)] text-white"
                        : "border-[rgba(255,255,255,0.2)] text-transparent",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span
                    className={[
                      "text-xs font-sans font-medium",
                      mission.isCompleted
                        ? "text-[var(--positive)] line-through"
                        : "text-[var(--fg-primary)]",
                    ].join(" ")}
                  >
                    {meta.label}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {mission.isCompleted ? (
                    <span className="text-xs font-mono font-bold text-[var(--positive)] tabular-nums">
                      +{mission.reward} BC ✅
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[var(--fg-tertiary)] tabular-nums">
                      +{mission.reward} BC
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
