"use client";

import type { UseRetentionReturn } from "@/hooks/useRetention";
import type { DailyMissionResponse } from "@/lib/api";

type MissionType = "FIRST_PREDICT" | "THREE_PREDICTS" | "SHARE";

const MISSION_META: Record<MissionType, { label: string }> = {
  FIRST_PREDICT: { label: "오늘 첫 예측 🎯" },
  THREE_PREDICTS: { label: "예측 3회 완료 🔥" },
  SHARE: { label: "결과 공유하기 📤" },
};

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-full bg-[var(--bg-tertiary)]",
        className ?? "",
      ].join(" ")}
    />
  );
}

interface RetentionPanelProps {
  retention: UseRetentionReturn;
  isGuest: boolean;
}

export default function RetentionPanel({ retention, isGuest }: RetentionPanelProps) {
  const { streak, missions, isLoading } = retention;

  // 게스트 유저 — 로그인 유도 메시지
  if (isGuest) {
    return (
      <div className="bg-[var(--bg-secondary)] border-2 border-[rgba(255,255,255,0.08)] rounded-[var(--radius-md)] p-4 text-center space-y-1">
        <p className="text-base">🍌</p>
        <p className="text-sm font-sans text-[var(--fg-secondary)]">
          로그인하면 스트릭을 쌓을 수 있어요 🍌
        </p>
        <p className="text-xs font-sans text-[var(--fg-tertiary)]">
          매일 출석하고 미션 보상을 받아보세요
        </p>
      </div>
    );
  }

  // 로딩 스켈레톤
  if (isLoading) {
    return (
      <div className="bg-[var(--bg-secondary)] border-2 border-[rgba(255,255,255,0.08)] rounded-[var(--radius-md)] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <SkeletonBar className="h-2 w-16" />
            <SkeletonBar className="h-3 w-28" />
          </div>
          <SkeletonBar className="h-4 w-10" />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBar key={i} className="flex-1 h-2" />
          ))}
        </div>
        <div className="border-t border-[rgba(255,255,255,0.06)]" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBar key={i} className="h-9 w-full rounded-[var(--radius-sm)]" />
          ))}
        </div>
      </div>
    );
  }

  const safeStreak = Math.max(0, streak?.currentStreak ?? 0);
  const safeMaxStreak = Math.max(0, streak?.maxStreak ?? 0);
  const completedCount = missions.filter((m: DailyMissionResponse) => m.isCompleted).length;

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
                active ? "bg-[var(--brand-primary)]" : "bg-[var(--bg-tertiary)]",
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
          {missions.map((mission: DailyMissionResponse) => {
            const meta = MISSION_META[mission.type as MissionType];
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
                    {meta?.label ?? mission.type}
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
