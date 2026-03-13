'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, X, Info, AlertTriangle, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: 'from-green-500 to-emerald-600 border-green-400',
  error: 'from-red-500 to-rose-600 border-red-400',
  info: 'from-blue-500 to-cyan-600 border-blue-400',
  warning: 'from-orange-500 to-amber-600 border-orange-400',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const t = timerRefs.current.get(id);
    if (t) {
      clearTimeout(t);
      timerRefs.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', title?: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { id, message, type, title }]);
      const timer = setTimeout(() => dismiss(id), 5000);
      timerRefs.current.set(id, timer);
    },
    [dismiss]
  );

  // Check for pending toasts stored before a page redirect (e.g. after employee creation)
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingToast');
    if (pending) {
      sessionStorage.removeItem('pendingToast');
      try {
        const { message, type, title } = JSON.parse(pending);
        showToast(message, type as ToastType, title);
      } catch {
        // ignore malformed data
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Ribbon / Toast Container — fixed top-center */}
      <div
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 items-center pointer-events-none w-full max-w-lg px-4"
      >
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto w-full bg-gradient-to-r ${STYLES[toast.type]} rounded-xl border shadow-2xl flex items-center gap-4 px-5 py-4 animate-in slide-in-from-top-4 fade-in duration-300`}
            >
              <Icon className="w-6 h-6 text-white shrink-0" />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-white font-bold text-sm leading-tight">{toast.title}</p>
                )}
                <p className="text-white/90 text-sm leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="p-1 text-white/70 hover:text-white rounded transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
