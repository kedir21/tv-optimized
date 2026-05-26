import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, User } from 'lucide-react';

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
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter uppercase">Personnel</h2>
          </div>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] ml-5">Validated Cast Members</p>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-8 px-2"
      >
        {cast.slice(0, 20).map((person, i) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group flex flex-col items-center flex-shrink-0 w-32 md:w-40"
          >
            <div className="relative w-28 h-28 md:w-36 md:h-36 mb-5 rounded-full p-1 bg-white/5 border border-white/5 group-hover:border-rose-500/50 group-hover:shadow-[0_0_40px_rgba(225,29,72,0.3)] transition-all duration-500">
                <div className="w-full h-full rounded-full overflow-hidden">
                    {person.profile_path ? (
                        <img
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#101015] flex items-center justify-center text-white/5">
                            <User size={48} />
                        </div>
                    )}
                </div>
                {/* Tech Aura */}
                <div className="absolute inset-0 rounded-full border border-rose-500/0 group-hover:border-rose-500/20 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700" />
            </div>
            
            <h3 className="text-sm font-black text-white text-center line-clamp-1 group-hover:text-rose-500 transition-colors uppercase tracking-widest leading-tight">
              {person.name}
            </h3>
            <p className="mt-1 text-[10px] text-white/20 text-center font-bold uppercase tracking-wider line-clamp-1">{person.character}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
