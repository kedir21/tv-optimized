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
    // Ensure we have a valid name/title for the content type
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
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative group cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0 w-[40vw] sm:w-[160px] md:w-[200px] lg:w-[240px] aspect-[2/3]"
    >
      <img
        src={getPosterUrl(item.poster_path)}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col justify-end p-4 bg-gradient-to-t from-black via-black/40 to-transparent"
          >
            <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 mb-3">
              {title}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/watch/${item.id}?type=tv`); }}
                className="flex-1 h-9 rounded-lg bg-white text-black flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-colors duration-200"
              >
                <Play size={14} className="fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">Play</span>
              </button>
              <button 
                onClick={handleWatchlist}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border border-white/10 ${inWatchlist ? 'bg-rose-500 border-rose-500 text-white' : 'bg-black/40 hover:bg-white/20 text-white'}`}
              >
                {inWatchlist ? <Check size={16} /> : <Heart size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-white/60">
               <div className="flex items-center gap-1.5 text-amber-400">
                  <Star size={11} className="fill-current" />
                  <span>{item.vote_average?.toFixed(1)}</span>
               </div>
               <span>K-DRAMA</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-20">
        <div className="px-2 py-0.5 rounded-md bg-rose-500/80 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-widest">
          K-Drama
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(KDramaCard);
