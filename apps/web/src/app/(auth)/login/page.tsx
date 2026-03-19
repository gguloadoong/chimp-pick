"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsGuest, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    try {
      await loginAsGuest();
      router.push("/");
    } catch {
      setError("게스트 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* 로고 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-banana">🦍 ChimpPick</h1>
          <p className="mt-2 text-text-secondary">
            주식/코인 UP/DOWN 예측 배틀
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-text-secondary/20 bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-banana focus:outline-none"
              data-testid="login-email"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-text-secondary/20 bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-banana focus:outline-none"
              data-testid="login-password"
            />
          </div>

          {error && (
            <p className="text-sm text-down" data-testid="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full rounded-xl bg-banana py-3 font-bold text-bg-primary transition-all hover:shadow-[0_0_20px_rgba(255,184,0,0.3)] active:scale-95 disabled:opacity-50"
            data-testid="login-submit"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-text-secondary/20" />
          <span className="text-sm text-text-secondary">또는</span>
          <div className="h-px flex-1 bg-text-secondary/20" />
        </div>

        {/* 게스트 로그인 */}
        <button
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full rounded-xl border border-text-secondary/30 bg-bg-secondary py-3 font-medium text-text-primary transition-all hover:border-banana/50 active:scale-95 disabled:opacity-50"
          data-testid="guest-login"
        >
          🍌 게스트로 체험하기 (3회 무료)
        </button>

        <p className="text-center text-xs text-text-secondary">
          가입하면 바나나코인 100개를 드려요!
        </p>
      </div>
    </div>
  );
}
