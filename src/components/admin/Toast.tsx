"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

const ToastContext = createContext<{ showToast: (message: string, type?: "success" | "error") => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2.5 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-5 py-3 rounded-[12px] shadow-lg text-[0.88rem] font-medium text-white animate-[fadeIn_0.2s_ease]"
            style={{ background: t.type === "error" ? "var(--danger)" : "var(--gold-dark)" }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
