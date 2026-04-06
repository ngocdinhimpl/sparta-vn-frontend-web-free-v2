import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 min-w-[160px] flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-red-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div>
        </div>

        {/* Message */}
        {loadingMessage && (
          <p className="mt-4 text-base font-semibold text-slate-700 text-center">
            {loadingMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingOverlay;
