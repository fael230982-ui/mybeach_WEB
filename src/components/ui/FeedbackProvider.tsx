"use client";

import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
};

type FeedbackContextValue = {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function getToastStyles(tone: ToastTone) {
  if (tone === "success") {
    return {
      icon: CheckCircle2,
      card: "border-emerald-200 bg-emerald-50 text-emerald-950",
      accent: "text-emerald-600",
    };
  }

  if (tone === "error") {
    return {
      icon: XCircle,
      card: "border-red-200 bg-red-50 text-red-950",
      accent: "text-red-600",
    };
  }

  return {
    icon: Info,
    card: "border-cyan-200 bg-cyan-50 text-cyan-950",
    accent: "text-cyan-600",
  };
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  function showToast(toast: Omit<ToastItem, "id">) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }

  function confirm(options: ConfirmOptions) {
    setConfirmState({ ...options, open: true });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }

  function closeConfirm(result: boolean) {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setConfirmState(null);
  }

  const value = useMemo(() => ({ showToast, confirm }), []);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed top-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.tone);
          const Icon = styles.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-3 duration-300 ${styles.card}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.accent}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-xs leading-5 opacity-80">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                  className="rounded-lg p-1 text-current/60 transition-colors hover:bg-black/5 hover:text-current"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {confirmState?.open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  confirmState.tone === "danger" ? "bg-red-50 text-red-600" : "bg-cyan-50 text-cyan-600"
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900">{confirmState.title}</h3>
                {confirmState.description ? (
                  <p className="mt-2 text-sm leading-6 text-slate-500">{confirmState.description}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {confirmState.cancelLabel || "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors ${
                  confirmState.tone === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-cyan-600 hover:bg-cyan-700"
                }`}
              >
                {confirmState.confirmLabel || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }

  return context;
}
