import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ContentItem } from '../../types';
import { getPosterUrl, getImageUrl } from '../../services/api';

interface SimilarCarouselProps {
  items: ContentItem[];
  mediaType: 'movie' | 'tv';
  onSelect: (item: ContentItem) => void;
}

export const SimilarCarousel: React.FC<SimilarCarouselProps> = ({ items, mediaType, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (!items.length) return null;

  const hovered = items.find((i) => i.id === hoveredId);

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="mb-16 md:mb-24 relative"
    >
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <Sparkles className="w-5 h-5 text-violet-300" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">You May Also Like</h2>
      </div>

      {hovered?.backdrop_path && (
        <motion.div
          key={hovered.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden md:block absolute right-0 top-0 w-1/2 h-48 -z-10 rounded-2xl overflow-hidden opacity-30 blur-sm pointer-events-none"
        >
          <img src={getImageUrl(hovered.backdrop_path)} alt="" className="w-full h-full object-cover" />
        </motion.div>
      )}

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x"
      >
        {items.slice(0, 16).map((item) => {
          const title = 'title' in item ? item.title : (item as { name?: string }).name;
          const isHovered = hoveredId === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onSelect({ ...item, media_type: item.media_type || mediaType })}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative flex-shrink-0 snap-start text-left transition-all duration-400 ${
                isHovered ? 'w-44 md:w-52 scale-105 z-20' : 'w-32 md:w-36 scale-100 z-10'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`aspect-[2/3] rounded-xl overflow-hidden border transition-all duration-400 ${
                  isHovered
                    ? 'border-violet-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(139,92,246,0.25)]'
                    : 'border-white/[0.06]'
                }`}
              >
                <img
                  src={getPosterUrl(item.poster_path)}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {isHovered && item.backdrop_path && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={getImageUrl(item.backdrop_path)}
                      alt=""
                      className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <p className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white line-clamp-2">
                      {title}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
};
