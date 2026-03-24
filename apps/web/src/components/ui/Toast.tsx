"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { border: string; icon: string }> = {
  success: { border: "border-l-[var(--positive)]", icon: "text-[var(--positive)]" },
  error:   { border: "border-l-[var(--negative)]", icon: "text-[var(--negative)]" },
  info:    { border: "border-l-[var(--brand-primary)]", icon: "text-[var(--brand-primary)]" },
};

const ToastIcon: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={18} aria-hidden="true" />,
  error:   <XCircle size={18} aria-hidden="true" />,
  info:    <Info size={18} aria-hidden="true" />,
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onDismiss]);

  const styles = toastStyles[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid={`toast-${toast.type}`}
      className={[
        "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)]",
        "bg-[var(--bg-elevated)] border border-[var(--border-primary)] border-l-4",
        "shadow-[var(--shadow-2)]",
        "animate-slide-up",
        styles.border,
      ].join(" ")}
    >
      <span className={styles.icon}>{ToastIcon[toast.type]}</span>
      <span className="text-sm text-[var(--fg-primary)] flex-1 font-sans">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="닫기"
        className="text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] transition-colors"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-label="알림"
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
