"use client";

import ChimpCharacter from "@/components/character/ChimpCharacter";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] px-4">
      <ChimpCharacter mood="lose" size={100} className="mb-4" />
      <h2 className="text-xl font-heading font-bold text-[var(--fg-primary)] mb-2">
        앗, 문제가 생겼어요!
      </h2>
      <p className="text-sm text-[var(--fg-secondary)] font-sans mb-6 text-center">
        침팬지가 바나나 껍질에 미끄러졌나 봐요...
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-[var(--radius-md)] bg-[var(--brand-primary)] text-[var(--brand-on-primary)] font-heading font-bold shadow-[var(--shadow-1)] btn-press"
      >
        다시 시도하기 🍌
      </button>
    </div>
  );
}
