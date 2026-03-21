"use client";

import ChimpCharacter from "@/components/character/ChimpCharacter";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary px-4">
      <ChimpCharacter mood="lose" size={100} className="mb-4" />
      <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
        앗, 문제가 생겼어요!
      </h2>
      <p className="text-sm text-text-secondary font-sans mb-6 text-center">
        침팬지가 바나나 껍질에 미끄러졌나 봐요...
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-2xl bg-banana text-white font-heading font-bold border-2 border-banana/80 clay btn-clay"
      >
        다시 시도하기 🍌
      </button>
    </div>
  );
}
