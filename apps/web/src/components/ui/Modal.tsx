"use client";

import { type ReactNode, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  "data-testid"?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  title,
  "data-testid": testId,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid={testId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[8px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={[
          "relative z-10 w-full max-w-md",
          "bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-6",
          "shadow-[var(--shadow-3)]",
        ].join(" ")}
        style={{ animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-[var(--fg-primary)] font-sans">{title}</h2>
          )}
          <button
            onClick={onClose}
            aria-label="닫기"
            className="ml-auto p-1.5 rounded-[var(--radius-sm)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--interactive-hover)] transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
