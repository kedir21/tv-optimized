import React, { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentItem } from '../types';
import { getImageUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { Star, Heart, Check, Play, Plus, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MediaCardProps {
  item: ContentItem;
  onClick: () => void;
  variant?: 'landscape' | 'portrait';
  className?: string;
  themeColor?: string;
}

const MediaCard = forwardRef<HTMLDivElement, MediaCardProps>(({ 
  item, 
  onClick, 
  variant = 'landscape',
  className = '', 
  themeColor = 'rose-500' 
}, ref) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const title = 'title' in item ? item.title : (item as any).name;
  const date = 'release_date' in item ? item.release_date : (item as any).first_air_date;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  useEffect(() => {
    const checkStatus = async () => {
      const exists = await watchlistService.isInWatchlist(item.id);
      setInWatchlist(exists);
    };
    checkStatus();
    window.addEventListener('watchlist-updated', checkStatus);
    return () => window.removeEventListener('watchlist-updated', checkStatus);
  }, [item.id, user]);

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInWatchlist(prev => !prev);
    watchlistService.toggleWatchlist(item);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${item.id}?type=${item.media_type || 'movie'}`);
  };

  if (variant === 'portrait') {
    return (
      <motion.div
        ref={ref}
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ 
            y: -10,
            scale: 1.02,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
        }}
        className={`relative group cursor-pointer flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[230px] aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl transition-all duration-500 ${className}`}
      >
        {/* Poster Image */}
        <img
          src={getImageUrl(item.poster_path)}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:brightness-50"
        />
        
        {/* Smooth Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content Info (Visible on Hover) */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]">
            <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-0.5 rounded-md glass text-[9px] font-black uppercase tracking-tighter text-white border border-white/10">
                    {item.media_type === 'movie' ? 'Movie' : 'Series'}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                    <Star size={10} className="fill-current" />
                    <span>{rating}</span>
                </div>
            </div>
            
            <h3 className="text-white font-display font-bold text-sm md:text-base line-clamp-2 mb-4">
                {title}
            </h3>

            <div className="flex items-center gap-2">
                <button 
                    onClick={handlePlay}
                    style={{ backgroundColor: 'var(--accent)' }}
                    className="flex-1 h-9 rounded-xl text-white flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/20"
                >
                    <Play size={14} className="fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Watch</span>
                </button>
                <button 
                    onClick={handleToggleWatchlist}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all ${inWatchlist ? 'text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    style={inWatchlist ? { backgroundColor: 'var(--accent)' } : {}}
                >
                    {inWatchlist ? <Check size={16} /> : <Plus size={16} />}
                </button>
            </div>
        </div>

        {/* Static Info (Visible when not hovered) */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-10 group-hover:opacity-0 transition-opacity duration-300">
            <div className="w-8 h-0.5 mb-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <h3 className="text-white font-display font-semibold text-xs line-clamp-1 mb-1">
                {title}
            </h3>
            <div className="text-[10px] font-medium text-white/40">
                {date?.split('-')[0]}
            </div>
        </div>

        {/* Hover Highlight Glow */}
        <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" 
            style={{ backgroundColor: 'var(--accent)' }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative group cursor-pointer flex-shrink-0 w-[260px] sm:w-[300px] md:w-[350px] lg:w-[400px] aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl transition-all duration-500 ${className}`}
    >
      <img
        src={getImageUrl(item.backdrop_path || item.poster_path)}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:brightness-50"
      />

      <div className="absolute top-3 inset-x-3 flex justify-between items-start z-20">
        <div className="flex gap-2">
            <div className="px-2 py-1 rounded-lg glass text-[9px] font-black uppercase tracking-tighter text-white flex items-center gap-1 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
                {item.media_type === 'movie' ? 'Movie' : 'Series'}
            </div>
            <div className="px-2 py-1 rounded-lg glass text-[9px] font-bold text-amber-400 flex items-center gap-1 border border-white/10">
                <Star size={10} className="fill-current" />
                <span>{rating}</span>
            </div>
        </div>
        <button 
            onClick={handleToggleWatchlist}
            style={inWatchlist ? { backgroundColor: 'var(--accent)' } : {}}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border border-white/10 backdrop-blur-md ${inWatchlist ? 'text-white' : 'bg-black/40 text-white hover:bg-white/20'}`}
        >
            {inWatchlist ? <Check size={14} /> : <Plus size={14} />}
        </button>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 z-10 flex flex-col justify-end p-5 bg-gradient-to-t from-black via-black/40 to-transparent"
          >
            <div className="space-y-3">
                <h3 className="text-white font-display font-bold text-sm md:text-lg line-clamp-1 group-hover:text-rose-500 transition-colors">
                    {title}
                </h3>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePlay}
                        style={{ backgroundColor: 'var(--accent)' }}
                        className="flex-1 h-10 rounded-xl text-white flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/20"
                    >
                        <Play size={14} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Watch Now</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold">
                        <Clock size={12} />
                        <span>{date?.split('-')[0]}</span>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div 
        className="absolute bottom-0 left-0 h-[3px] transition-all duration-500 w-0 group-hover:w-full" 
        style={{ backgroundColor: 'var(--accent)' }}
      />
    </motion.div>
  );
});

export default React.memo(MediaCard);
