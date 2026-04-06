import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`skeleton-shimmer rounded-xl ${className}`}></div>
);

const VocabularyListSkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 pb-10">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md py-4 z-10 px-2">
        <Shimmer className="w-10 h-10 rounded-full" />
        <Shimmer className="h-8 w-48 rounded-lg" />
      </div>

      {/* List Container Skeleton */}
      <div className="space-y-4 px-2">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index}
            className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div className="flex-1 space-y-2">
              <Shimmer className="h-7 w-40 rounded-lg" />
              <Shimmer className="h-4 w-32 rounded-md" />
            </div>
            
            <div className="flex items-center gap-3">
              <Shimmer className="w-10 h-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocabularyListSkeleton;
