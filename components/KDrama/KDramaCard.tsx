import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentItem } from '../../types';
import { getPosterUrl } from '../../services/api';
import { watchlistService } from '../../services/watchlist';

interface KDramaCardProps {
  item: ContentItem;
  onSelect: (item: ContentItem) => void;
}

const KDramaCard: React.FC<KDramaCardProps> = ({ item, onSelect }) => {
  const navigate = useNavigate();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const title = (item as any).name || (item as any).title || '';

  useEffect(() => {
    watchlistService.isInWatchlist(item.id).then(setInWatchlist);
  }, [item.id]);

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const watchlistContent = { 
      ...item, 
      media_type: item.media_type || 'tv' 
    } as ContentItem;
    
    await watchlistService.toggleWatchlist(watchlistContent);
    setInWatchlist((p) => !p);
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative group cursor-pointer rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[230px] aspect-[2/3] shadow-2xl"
    >
      <img
        src={getPosterUrl(item.poster_path)}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:brightness-50"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col justify-end p-4"
          >
            <h3 className="text-white font-display font-bold text-sm md:text-base line-clamp-2 mb-3">
              {title}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/watch/${item.id}?type=tv`); }}
                className="flex-1 h-9 rounded-xl bg-white text-black flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-lg"
              >
                <Play size={14} className="fill-current" />
                <span className="text-[10px] font-black uppercase tracking-widest">Play</span>
              </button>
              <button 
                onClick={handleWatchlist}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border border-white/10 backdrop-blur-xl ${inWatchlist ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {inWatchlist ? <Check size={16} /> : <Heart size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-white/50">
               <div className="flex items-center gap-1.5 text-amber-400">
                  <Star size={11} className="fill-current" />
                  <span>{item.vote_average?.toFixed(1)}</span>
               </div>
               <span className="tracking-tighter">K-DRAMA</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-3 left-3 z-20 pointer-events-none group-hover:opacity-0 transition-opacity">
        <div className="px-2 py-0.5 rounded-md glass text-[9px] font-black text-rose-500 uppercase tracking-widest border border-rose-500/20">
          K-Drama
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 z-10 group-hover:opacity-0 transition-opacity duration-300">
          <div className="w-8 h-0.5 bg-rose-500 mb-2 rounded-full" />
          <h3 className="text-white font-display font-semibold text-xs line-clamp-1">
              {title}
          </h3>
      </div>
    </motion.div>
  );
};

export default React.memo(KDramaCard);
