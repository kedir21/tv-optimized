
import React from 'react';

// Basic Block Skeleton
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}>
     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
  </div>
);

// High-Fidelity Poster Skeleton
export const MovieCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative flex-shrink-0 w-36 md:w-48 lg:w-56 aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-xl ${className}`}>
    {/* Cinematic Shimmer Overlay */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    
    {/* Abstract Content Placeholders */}
    <div className="absolute bottom-4 left-3 right-3 space-y-2 opacity-20">
        <div className="h-2 bg-white rounded-full w-3/4" />
        <div className="h-2 bg-white rounded-full w-1/2" />
    </div>
  </div>
);

// Row Skeleton with Header
export const RowSkeleton: React.FC = () => (
  <div className="mb-8 md:mb-12 pl-4 md:pl-12">
    {/* Section Title */}
    <div className="h-6 md:h-8 w-32 md:w-48 bg-white/5 rounded-md mb-4 md:mb-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
    </div>
    
    <div className="flex gap-4 md:gap-6 overflow-hidden py-2 px-1">
      {[...Array(6)].map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Full-screen Hero Skeleton
export const HeroSkeleton: React.FC = () => (
    <div className="relative h-[70vh] md:h-[85vh] w-full mb-8 bg-slate-900 overflow-hidden group">
        {/* Subtle Background Pulse */}
        <div className="absolute inset-0 bg-slate-900 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite]" />
        
        <div className="relative z-10 h-full flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 max-w-4xl">
            {/* Title Placeholder */}
            <div className="h-10 md:h-20 w-3/4 md:w-2/3 bg-white/10 rounded-xl mb-6 md:mb-8 backdrop-blur-sm" />
            
            {/* Description Lines */}
            <div className="space-y-3 mb-8 md:mb-10 w-full md:w-1/2 opacity-40">
                <div className="h-3 md:h-4 bg-white rounded-full w-full" />
                <div className="h-3 md:h-4 bg-white rounded-full w-5/6" />
                <div className="h-3 md:h-4 bg-white rounded-full w-4/6" />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
                <div className="h-12 w-32 md:h-14 md:w-40 bg-white/10 rounded-lg backdrop-blur-md" />
                <div className="h-12 w-32 md:h-14 md:w-40 bg-white/5 rounded-lg backdrop-blur-md" />
            </div>
        </div>
    </div>
);

// Details Page Skeleton
export const DetailsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-950 relative overflow-hidden">
    {/* Fake Backdrop */}
    <div className="fixed inset-0 bg-gray-900" />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2.5s_infinite]" />
    
    <div className="relative z-10 min-h-screen px-4 md:px-20 pt-20 md:pt-24 pb-20">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        {/* Left Column: Poster & Actions */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6 md:gap-8">
          <div className="aspect-[2/3] w-2/3 mx-auto lg:w-full bg-white/5 rounded-xl border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-12 md:h-14 bg-white/10 rounded-lg w-full" />
            <div className="h-12 md:h-14 bg-white/5 rounded-lg w-full" />
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="w-full lg:w-3/4 flex flex-col items-center lg:items-start pt-4">
          {/* Title */}
          <div className="h-10 md:h-16 w-3/4 bg-white/10 rounded-xl mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
          
          {/* Metadata Row */}
          <div className="flex gap-4 mb-8 opacity-50">
            <div className="h-6 w-16 bg-white/10 rounded-full" />
            <div className="h-6 w-16 bg-white/10 rounded-full" />
            <div className="h-6 w-16 bg-white/10 rounded-full" />
          </div>

          {/* Overview Block */}
          <div className="space-y-3 w-full max-w-3xl mb-10 opacity-40">
              <div className="h-4 bg-white rounded-full w-full" />
              <div className="h-4 bg-white rounded-full w-full" />
              <div className="h-4 bg-white rounded-full w-5/6" />
              <div className="h-4 bg-white rounded-full w-4/6" />
          </div>

          {/* Cast Section */}
          <div className="mb-12 w-full">
            <div className="h-8 w-32 bg-white/10 rounded-lg mb-6" />
            <div className="flex gap-4 md:gap-6 overflow-hidden">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="flex flex-col items-center gap-3">
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
                   </div>
                   <div className="h-3 w-16 bg-white/5 rounded-full" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
