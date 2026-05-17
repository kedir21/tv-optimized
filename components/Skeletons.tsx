
import React from 'react';

// Skeleton base with shimmer
const SkeletonBase: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl shimmer ${className}`} style={{ backgroundColor: 'var(--bg-card)' }} />
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SkeletonBase className={className} />
);

export const MovieCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative flex-shrink-0 w-36 md:w-44 lg:w-52 aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden border border-white/[0.04] ${className}`} style={{ backgroundColor: 'var(--bg-card)' }}>
    <div className="w-full h-full shimmer" />
    <div className="absolute bottom-4 left-3 right-3 space-y-2">
      <div className="h-2 bg-white/[0.06] rounded-full w-3/4" />
      <div className="h-2 bg-white/[0.06] rounded-full w-1/2" />
    </div>
  </div>
);

export const RowSkeleton: React.FC = () => (
  <div className="mb-10 md:mb-16 pl-4 md:pl-12">
    <div className="flex items-center gap-3 mb-5 md:mb-7">
      <div className="w-1 h-5 md:h-6 rounded-full shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
      <div className="h-5 w-28 md:w-36 rounded-lg shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
    </div>
    <div className="flex gap-3 md:gap-5 overflow-hidden py-4 px-1">
      {[...Array(6)].map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative h-[75vh] md:h-[85vh] w-full mb-8 overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
    
    <div className="relative z-10 h-full flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 max-w-4xl">
      <div className="h-8 md:h-14 w-3/4 md:w-2/3 rounded-xl mb-5 shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
      
      <div className="space-y-3 mb-8 w-full md:w-1/2">
        <div className="h-3 rounded-full w-full shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="h-3 rounded-full w-5/6 shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="h-3 rounded-full w-4/6 shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
      </div>

      <div className="flex gap-3">
        <div className="h-12 w-32 rounded-xl shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="h-12 w-32 rounded-xl shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
      </div>
    </div>
  </div>
);

export const DetailsSkeleton: React.FC = () => (
  <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
    <div className="relative z-10 min-h-screen px-4 md:px-20 pt-20 md:pt-24 pb-20">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        <div className="w-full lg:w-1/4 flex flex-col gap-6 md:gap-8">
          <div className="aspect-[2/3] w-2/3 mx-auto lg:w-full rounded-2xl border border-white/[0.04]" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="w-full h-full shimmer rounded-2xl" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-12 rounded-xl w-full shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="h-12 rounded-xl w-full shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
          </div>
        </div>

        <div className="w-full lg:w-3/4 flex flex-col items-center lg:items-start pt-4">
          <div className="h-10 md:h-14 w-3/4 rounded-xl mb-6 shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
          
          <div className="flex gap-3 mb-8">
            <div className="h-6 w-16 rounded-full shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
            <div className="h-6 w-16 rounded-full shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
            <div className="h-6 w-16 rounded-full shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
          </div>

          <div className="space-y-3 w-full max-w-3xl mb-10">
            <div className="h-3 rounded-full w-full shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
            <div className="h-3 rounded-full w-full shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
            <div className="h-3 rounded-full w-5/6 shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
          </div>

          <div className="mb-12 w-full">
            <div className="h-6 w-28 rounded-lg mb-6 shimmer" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="flex gap-4 md:gap-6 overflow-hidden">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="flex flex-col items-center gap-3">
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
