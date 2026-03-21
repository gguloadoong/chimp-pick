import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "리더보드 — 침팬지픽",
  description: "침팬지픽 예측 배틀 리더보드. 소수파 보너스로 최고 점수를 노려보세요!",
};

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
