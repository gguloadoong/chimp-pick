"use client";

import { useToastStore } from "@/stores/toastStore";

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "flex items-center gap-2 px-4 py-3 rounded-2xl border-2 animate-slide-up cursor-pointer",
            "shadow-lg backdrop-blur-sm",
            toast.type === "success" ? "bg-up/90 border-up/50 text-white" :
            toast.type === "warning" ? "bg-banana/90 border-banana/50 text-white" :
            "bg-white/95 border-card-border text-text-primary",
          ].join(" ")}
          onClick={() => removeToast(toast.id)}
          role="alert"
        >
          <span className="text-lg">{toast.emoji}</span>
          <span className="text-sm font-sans font-semibold flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
