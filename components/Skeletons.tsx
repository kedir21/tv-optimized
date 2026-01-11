import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

export const MovieCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex-shrink-0 w-32 md:w-48 lg:w-56 aspect-[2/3] rounded-lg bg-white/5 animate-pulse border border-white/5 ${className}`} />
);

export const RowSkeleton: React.FC = () => (
  <div className="flex gap-4 md:gap-6 overflow-hidden py-4 px-1">
    {[...Array(6)].map((_, i) => (
      <MovieCardSkeleton key={i} />
    ))}
  </div>
);

export const DetailsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-950 relative overflow-hidden animate-pulse">
    {/* Fake Backdrop */}
    <div className="fixed inset-0 bg-gray-900/50" />
    
    <div className="relative z-10 min-h-screen px-4 md:px-20 pt-20 md:pt-24 pb-20">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        {/* Left Column: Poster & Actions */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6 md:gap-8">
          <div className="aspect-[2/3] w-2/3 mx-auto lg:w-full bg-white/5 rounded-xl border-2 border-white/5" />
          <div className="flex flex-col gap-4">
            <div className="h-12 md:h-14 bg-white/5 rounded-lg w-full" />
            <div className="h-12 md:h-14 bg-white/5 rounded-lg w-full" />
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="w-full lg:w-3/4 flex flex-col items-center lg:items-start">
          <div className="h-10 md:h-16 w-3/4 bg-white/5 rounded-lg mb-6" />
          
          <div className="flex gap-4 mb-8">
            <div className="h-6 w-16 bg-white/5 rounded-full" />
            <div className="h-6 w-16 bg-white/5 rounded-full" />
            <div className="h-6 w-16 bg-white/5 rounded-full" />
          </div>

          <div className="h-32 w-full bg-white/5 rounded-lg mb-10" />

          {/* Cast */}
          <div className="mb-12 w-full">
            <div className="h-8 w-32 bg-white/5 rounded-lg mb-6" />
            <div className="flex gap-4 md:gap-6 overflow-hidden">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="flex flex-col items-center gap-3">
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5" />
                   <div className="h-3 w-16 bg-white/5 rounded" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);