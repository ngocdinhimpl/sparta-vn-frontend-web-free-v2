import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`skeleton-shimmer rounded-xl ${className}`}></div>
);

const HistorySkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col animate-in fade-in duration-500 pb-20">
      {/* Summary Card Skeleton */}
      <div className="bg-red-500 rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-red-100 mb-12 min-h-[320px] flex flex-col justify-center">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-3">
              <div className="h-3 w-32 bg-white/20 rounded-md"></div>
              <div className="h-16 w-24 bg-white/20 rounded-lg"></div>
            </div>
            <div className="w-16 h-16 bg-white/25 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center shadow-lg border border-white/20"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/15 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/10 flex flex-col justify-center space-y-2">
                <div className="h-2 w-16 bg-white/20 rounded"></div>
                <div className="h-6 w-12 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-red-400/40 rounded-full blur-[80px]"></div>
        <div className="absolute left-1/4 -top-10 w-40 h-40 bg-white/15 rounded-full blur-[60px]"></div>
        <div className="absolute right-10 top-10 w-20 h-20 bg-red-300/20 rounded-full blur-xl animate-pulse"></div>
      </div>

      {/* List Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        <Shimmer className="h-3 w-40 rounded-md" />
      </div>

      {/* Sessions List Skeleton */}
      <div className="space-y-4 px-2 flex-1">
        {[...Array(5)].map((_, index) => (
          <div 
            key={index}
            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <Shimmer className="w-14 h-14 rounded-2xl" />
            
            <div className="flex-1 space-y-2">
              <Shimmer className="h-5 w-32 rounded-md" />
              <Shimmer className="h-3 w-24 rounded-sm" />
            </div>
            
            <div className="text-right space-y-2">
              <Shimmer className="h-5 w-8 rounded-md ml-auto" />
              <Shimmer className="h-3 w-20 rounded-sm ml-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button Skeleton */}
      <div className="fixed bottom-28 right-8 md:bottom-12 md:right-12 w-16 h-16 bg-red-300 rounded-full shadow-2xl shadow-red-100 animate-pulse z-40"></div>
    </div>
  );
};

export default HistorySkeleton;
