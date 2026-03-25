"use client";

interface AdSlotProps {
  placement: "result-lose" | "result-win" | "home-bottom" | "between-rounds";
  className?: string;
}

export default function AdSlot({ placement, className }: AdSlotProps) {
  if (placement === "result-win" || placement === "between-rounds") {
    return null;
  }

  if (placement === "result-lose") {
    return (
      <div
        data-ad-placement={placement}
        className={[
          "h-20 flex items-center justify-between gap-3 px-4",
          "border-2 border-dashed border-[var(--brand-primary)] rounded-[var(--radius-md)]",
          "bg-[var(--brand-primary)]/5",
          className ?? "",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0" aria-hidden="true">
            🍌
          </span>
          <div className="min-w-0">
            <p className="text-xs font-heading font-bold text-[var(--brand-primary)] leading-tight truncate">
              광고 보고 코인 받기
            </p>
            <p className="text-[10px] text-[var(--fg-secondary)] font-sans truncate">
              광고 영역 (준비 중)
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          aria-label="광고 보고 바나나코인 받기 (준비 중)"
          className={[
            "shrink-0 px-3 py-1.5 rounded-[var(--radius-sm)]",
            "text-xs font-heading font-bold text-white",
            "bg-[var(--brand-primary)] opacity-50 cursor-not-allowed",
          ].join(" ")}
        >
          받기
        </button>
      </div>
    );
  }

  // home-bottom: slim banner
  return (
    <div
      data-ad-placement={placement}
      className={[
        "h-16 flex items-center justify-center gap-2 px-4",
        "border-2 border-dashed border-[var(--brand-primary)] rounded-[var(--radius-md)]",
        "bg-[var(--brand-primary)]/5",
        className ?? "",
      ].join(" ")}
    >
      <span className="text-xl" aria-hidden="true">
        🍌
      </span>
      <p className="text-[11px] text-[var(--fg-secondary)] font-sans">
        광고 영역 (준비 중)
      </p>
    </div>
  );
}
