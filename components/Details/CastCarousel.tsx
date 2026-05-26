import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

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
    <div className="py-12">
      <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Cast</h2>

      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto no-scrollbar pb-6"
      >
        {cast.slice(0, 15).map((person, i) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group flex flex-col items-center flex-shrink-0 w-24 md:w-28"
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24 mb-4 rounded-full overflow-hidden border border-white/5 group-hover:border-rose-500/30 transition-all duration-300">
                {person.profile_path ? (
                    <img
                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                    alt={person.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white/5">
                        <User size={32} />
                    </div>
                )}
            </div>
            
            <h3 className="text-[11px] font-bold text-white text-center line-clamp-1 group-hover:text-rose-500 transition-colors uppercase tracking-wider">
              {person.name}
            </h3>
            <p className="mt-1 text-[9px] text-white/30 text-center font-medium uppercase tracking-tight line-clamp-1">{person.character}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
