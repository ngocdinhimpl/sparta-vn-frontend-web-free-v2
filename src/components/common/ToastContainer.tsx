import React, { useEffect, useRef } from 'react';
import { Toast as ToastType, useToast } from '@/contexts/ToastContext';

interface ToastItemProps {
  toast: ToastType;
  index: number;
}

function ToastItem({ toast, index }: ToastItemProps) {
  const { hideToast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-50 border-l-red-500 text-red-900';
      case 'success':
        return 'bg-emerald-50 border-l-emerald-500 text-emerald-900';
      case 'warning':
        return 'bg-amber-50 border-l-amber-500 text-amber-900';
      case 'info':
        return 'bg-blue-50 border-l-blue-500 text-blue-900';
      default:
        return 'bg-slate-50 border-l-slate-500 text-slate-900';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        min-w-[320px] max-w-md
        border-l-4 rounded-lg shadow-lg
        p-4 mb-3
        flex items-start gap-3
        animate-in slide-in-from-right-full fade-in duration-300
        hover:shadow-xl transition-shadow
      `}
      style={{ 
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-relaxed break-words">
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => hideToast(toast.id)}
        className="flex-shrink-0 ml-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] pointer-events-none"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <div className="pointer-events-auto">
        {toasts.map((toast, index) => (
          <ToastItem key={toast.id} toast={toast} index={index} />
        ))}
      </div>
    </div>
  );
}
