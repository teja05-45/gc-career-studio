"use client";

import * as React from "react";

export type ToastVariant = "default" | "success" | "error" | "info";

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

type ToastInput = Omit<ToastProps, "id">;

type ToastContextValue = {
  toasts: ToastProps[];
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Simple global store so `toast()` can be called from anywhere (server
// actions / event handlers) without re-rendering React at the call site.
const listeners = new Set<(toast: ToastProps) => void>();

export function toast(input: ToastInput) {
  const id = Math.random().toString(36).slice(2, 10);
  listeners.forEach((listener) => listener({ id, ...input }));
  return id;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  React.useEffect(() => {
    const listener = (newToast: ToastProps) => {
      setToasts((prev) => [...prev, newToast]);
      // Auto-dismiss after 4.5s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}
