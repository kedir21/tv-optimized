import React from 'react';

const SkeletonBase: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl shimmer bg-white/5 ${className}`} />
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SkeletonBase className={className} />
);

export const MovieCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative flex-shrink-0 w-[40vw] sm:w-[150px] md:w-[180px] lg:w-[220px] aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-white/5 ${className}`}>
    <div className="w-full h-full shimmer" />
  </div>
);

export const RowSkeleton: React.FC = () => (
  <div className="py-6">
    <div className="h-8 w-48 mx-6 md:mx-12 lg:mx-20 mb-6 rounded-lg bg-white/5 shimmer" />
    <div className="flex gap-4 md:gap-6 overflow-hidden px-6 md:px-12 lg:px-20 py-2">
      {[...Array(6)].map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative h-screen w-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-32">
    <div className="h-6 w-32 rounded-full mb-6 bg-white/5 shimmer" />
    <div className="h-16 md:h-24 lg:h-32 w-3/4 rounded-2xl mb-8 bg-white/5 shimmer" />
    <div className="h-4 w-full max-w-2xl rounded-full mb-3 bg-white/5 shimmer" />
    <div className="h-4 w-5/6 max-w-2xl rounded-full mb-10 bg-white/5 shimmer" />
    <div className="flex gap-4">
      <div className="h-14 w-40 rounded-2xl bg-white/5 shimmer" />
      <div className="h-14 w-40 rounded-2xl bg-white/5 shimmer" />
    </div>
  </div>
);

export const DetailsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#040406]">
    <div className="relative h-[90vh] lg:min-h-screen w-full flex items-end">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-16 lg:pb-24">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 lg:gap-16">
                <div className="w-48 md:w-64 lg:w-80 aspect-[2/3] rounded-3xl bg-white/5 shimmer" />
                <div className="flex-1 w-full">
                    <div className="h-6 w-32 rounded-full mb-6 bg-white/5 shimmer" />
                    <div className="h-16 md:h-24 lg:h-32 w-3/4 rounded-2xl mb-8 bg-white/5 shimmer" />
                    <div className="h-4 w-full max-w-2xl rounded-full mb-3 bg-white/5 shimmer" />
                    <div className="h-4 w-5/6 max-w-2xl rounded-full mb-10 bg-white/5 shimmer" />
                </div>
            </div>
        </div>
    </div>
  </div>
);
