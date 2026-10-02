"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = React.useMemo(() => ({
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    info: (msg: string) => addToast("info", msg),
    warning: (msg: string) => addToast("warning", msg),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast portal overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let icon = <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
            let bgStyles = "bg-white/90 dark:bg-zinc-900/90 border-zinc-200/50 dark:border-zinc-800/50";
            
            if (t.type === "success") {
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
              bgStyles = "bg-emerald-50/90 border-emerald-200/50 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300";
            } else if (t.type === "error") {
              icon = <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
              bgStyles = "bg-red-50/90 border-red-200/50 text-red-950 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-300";
            } else if (t.type === "warning") {
              icon = <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
              bgStyles = "bg-amber-50/90 border-amber-200/50 text-amber-950 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300";
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg pointer-events-auto ${bgStyles}`}
              >
                {icon}
                <p className="text-xs font-semibold leading-relaxed flex-1">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-0.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shrink-0 border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
