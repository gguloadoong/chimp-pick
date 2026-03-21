import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로필 — 침팬지픽",
  description: "내 전적, 칭호, 레벨, 출석 현황을 확인하세요!",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
