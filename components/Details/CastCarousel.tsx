import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CastCarouselProps {
  cast: CastMember[];
}

export const CastCarousel: React.FC<CastCarouselProps> = ({ cast }) => {
  const ref = useRef<HTMLDivElement>(null);

  if (!cast?.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="mb-16 md:mb-24"
    >
      <motion.div className="flex items-center gap-3 mb-6 md:mb-8">
        <motion.div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <Users className="w-5 h-5 text-violet-300" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Cast</h2>
      </motion.div>

      <motion.div
        ref={ref}
        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x"
      >
        {cast.slice(0, 20).map((person, i) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 snap-start"
          >
            <motion.div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/[0.06] group-hover:border-violet-400/40 transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt={person.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <motion.div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                  <Users className="w-8 h-8 text-white/15" />
                </motion.div>
              )}
            </motion.div>
            <p className="mt-3 text-sm font-semibold text-white text-center line-clamp-1 group-hover:text-violet-200 transition-colors">
              {person.name}
            </p>
            <p className="text-[11px] text-white/35 text-center line-clamp-1 italic">{person.character}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};
