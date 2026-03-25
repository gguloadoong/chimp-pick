"use client";

import { useCallback } from "react";
import type { RoundResult } from "@/types";
import ChimpCharacter from "@/components/character/ChimpCharacter";
import Button from "@/components/ui/Button";

interface ShareCardProps {
  result: RoundResult;
  totalScore: number;
  level: number;
  onClose: () => void;
}

export default function ShareCard({ result, totalScore, level, onClose }: ShareCardProps) {
  const shareText = [
    `🦍 침팬지픽 ${result.isCorrect ? "적중!" : "도전!"}`,
    result.isCorrect ? `+${result.score}점 획득 🏆` : "다음엔 맞출 거야 💪",
    `종목: ${result.symbolName || "재미 예측"}  UP ${result.upRatio}% vs DOWN ${100 - result.upRatio}%`,
    "나도 예측하러 가기 → chimp-pick.vercel.app",
  ].join("\n");

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // clipboard not available
    }
  }, [shareText]);

  const shareKakao = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "침팬지픽",
          text: shareText,
          url: "https://chimp-pick.vercel.app",
        });
        return;
      } catch {
        // user cancelled or share failed — fall through to link copy
      }
    }
    // fallback: copy link
    try {
      await navigator.clipboard.writeText("https://chimp-pick.vercel.app");
    } catch {
      // clipboard not available
    }
  }, [shareText]);

  const shareTwitter = useCallback(() => {
    const encoded = encodeURIComponent(shareText);
    window.open(
      `https://twitter.com/intent/tweet?text=${encoded}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [shareText]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="mx-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {/* Preview card */}
        <div
          className={[
            "rounded-3xl p-6 text-center border-4 mb-4",
            result.isCorrect ? "bg-white border-up clay-up" : "bg-white border-down clay-down",
          ].join(" ")}
        >
          <ChimpCharacter mood={result.isCorrect ? "win" : "lose"} size={64} level={level} className="mx-auto mb-3" />

          <h3 className={["text-2xl font-heading font-bold", result.isCorrect ? "text-up" : "text-down"].join(" ")}>
            {result.isCorrect ? "적중! 🎉" : "빗나감 😵"}
          </h3>

          <p className="text-sm text-text-secondary font-sans mt-1 mb-3">
            {result.symbolName || "재미 예측"}
          </p>

          <p className={["text-3xl font-mono font-bold mb-2", result.isCorrect ? "text-banana" : "text-down"].join(" ")}>
            {result.isCorrect ? `+${result.score}점` : "0점"}
          </p>

          <p className="text-xs text-text-secondary font-sans">
            UP {result.upRatio}% vs DOWN {100 - result.upRatio}% · 총 {totalScore.toLocaleString()}점
          </p>

          <p className="text-xs text-card-border font-sans mt-3">chimp-pick.vercel.app</p>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 mb-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1 btn-press"
            onClick={shareKakao}
            aria-label="카카오톡으로 공유"
          >
            카카오
          </Button>
          <Button
            variant="outline"
            size="md"
            className="flex-1 btn-press"
            onClick={shareTwitter}
            aria-label="트위터로 공유"
          >
            트위터
          </Button>
          <Button
            variant="outline"
            size="md"
            className="flex-1 btn-press"
            onClick={copyText}
            aria-label="링크 복사"
          >
            링크복사
          </Button>
        </div>

        <Button variant="outline" size="md" className="w-full btn-press" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
