import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  onClick?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, onClick?: () => void) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'error', onClick?: () => void) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type, onClick };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds (or 8 seconds if clickable)
    setTimeout(() => {
      hideToast(id);
    }, onClick ? 8000 : 4000);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
