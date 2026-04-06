import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`skeleton-shimmer rounded-xl ${className}`}></div>
);

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-9 w-64 rounded-lg" />
          <Shimmer className="h-5 w-40 rounded-md" />
        </div>
        <Shimmer className="w-12 h-12 rounded-full" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Featured Coach Card Skeleton */}
          <Shimmer className="aspect-[16/9] md:aspect-[2.5/1] rounded-[2.5rem]" />
          
          {/* Stat Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Shimmer className="h-32 rounded-3xl" />
            <Shimmer className="h-32 rounded-3xl" />
            <Shimmer className="h-32 rounded-3xl" />
          </div>

          {/* Action Banner Skeleton */}
          <Shimmer className="h-48 rounded-[2.5rem]" />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center">
            <Shimmer className="h-6 w-32" />
            <Shimmer className="h-4 w-16" />
          </div>
          
          {/* Weak Sounds List Skeleton */}
          <div className="space-y-4">
            <Shimmer className="h-24 rounded-2xl" />
            <Shimmer className="h-24 rounded-2xl" />
            <Shimmer className="h-24 rounded-2xl" />
          </div>

          {/* Progress Chart Skeleton */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 space-y-4">
            <Shimmer className="h-6 w-40" />
            <Shimmer className="h-40 rounded-xl" />
            <div className="flex justify-between pt-2">
              {[...Array(7)].map((_, i) => (
                <Shimmer key={i} className="h-3 w-4" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
