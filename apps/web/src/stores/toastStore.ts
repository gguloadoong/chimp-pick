"use client";

import { create } from "zustand";

export interface ToastItem {
  id: string;
  message: string;
  emoji: string;
  type: "success" | "info" | "warning";
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, emoji: string, type?: ToastItem["type"]) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (message, emoji, type = "info") => {
    const id = crypto.randomUUID();
    set((s) => ({
      toasts: [...s.toasts.slice(-4), { id, message, emoji, type }],
    }));
    // Auto-remove after 3s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
