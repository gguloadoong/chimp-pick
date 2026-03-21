"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Trophy, User } from "lucide-react";
import { type ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: <Home size={22} aria-hidden="true" /> },
  { href: "/stats", label: "통계", icon: <BarChart2 size={22} aria-hidden="true" /> },
  { href: "/ranking", label: "랭킹", icon: <Trophy size={22} aria-hidden="true" /> },
  { href: "/profile", label: "프로필", icon: <User size={22} aria-hidden="true" /> },
];

interface BottomNavProps {
  "data-testid"?: string;
}

export default function BottomNav({ "data-testid": testId }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      data-testid={testId ?? "bottom-nav"}
      aria-label="하단 네비게이션"
      className={[
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-white border-t-2 border-card-border",
        "pb-[env(safe-area-inset-bottom)]",
        "shadow-[0_-4px_16px_rgba(255,184,0,0.12)]",
      ].join(" ")}
    >
      <ul className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-all duration-150",
                  isActive
                    ? "text-banana font-bold"
                    : "text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                <span
                  className={[
                    "transition-transform duration-150",
                    isActive ? "scale-110" : "",
                  ].join(" ")}
                >
                  {item.icon}
                </span>
                <span
                  className={[
                    "text-[10px] leading-none font-sans",
                    isActive ? "font-bold" : "font-medium",
                  ].join(" ")}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-banana" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
