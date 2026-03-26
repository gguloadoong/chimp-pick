"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface GuestNudgeProps {
  onSignup: () => void;
  onDismiss: () => void;
}

const STORAGE_KEY = "guest_nudge_dismissed";

export default function GuestNudge({ onSignup, onDismiss }: GuestNudgeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 마운트 후 slide-up 애니메이션 트리거
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
    // 애니메이션 후 콜백
    setTimeout(onDismiss, 300);
  };

  const handleSignup = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    onSignup();
  };

  return (
    <div
      className={[
        "fixed bottom-[env(safe-area-inset-bottom,0px)] left-0 right-0 z-50",
        "transform transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      role="banner"
      aria-label="회원가입 유도"
    >
      {/* 바나나색 배경 배너 */}
      <div className="mx-4 mb-4 rounded-2xl border-4 border-[var(--brand-primary)] bg-[var(--brand-primary)] shadow-2xl overflow-hidden">
        {/* 픽셀 상단 장식 */}
        <div className="flex gap-1 px-3 pt-2 pb-0" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-none"
              style={{
                background: i % 2 === 0 ? "rgba(0,0,0,0.15)" : "transparent",
              }}
            />
          ))}
        </div>

        <div className="p-4 pt-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-3xl flex-shrink-0" aria-hidden="true">
                🦍
              </span>
              <div className="min-w-0">
                <p className="font-heading font-bold text-[#1A1A1A] text-base leading-snug">
                  랭킹에 이름을 남겨요!
                </p>
                <p className="text-[13px] text-[#3D2800] font-sans mt-0.5 leading-snug">
                  지금 예측 기록이 사라지기 전에 가입하세요
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              aria-label="닫기"
            >
              <X size={14} color="#1A1A1A" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-black/10 text-[#1A1A1A] border-0 hover:bg-black/20"
              onClick={handleDismiss}
            >
              나중에
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#1A1A1A] text-[var(--brand-primary)] hover:brightness-110 font-bold"
              onClick={handleSignup}
            >
              회원가입 🍌
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 게스트 넛지를 표시해야 하는지 확인하는 헬퍼 */
export function shouldShowGuestNudge(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "1";
}
