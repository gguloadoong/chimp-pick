import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통계 — 침팬지픽",
  description: "카테고리별 승률, 일별 점수, 기록을 확인하세요!",
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
