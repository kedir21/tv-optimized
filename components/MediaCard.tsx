import React, { useState, useEffect } from 'react';
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

const MediaCard: React.FC<MediaCardProps> = ({ 
  item, 
  onClick, 
  variant = 'landscape',
  className = '', 
  themeColor = 'rose-500' 
}) => {
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
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ 
            scale: 1.05, 
            rotateY: 5,
            transition: { duration: 0.4, ease: "easeOut" } 
        }}
        className={`relative group cursor-pointer w-full aspect-[2/3] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-500 perspective-1000 ${className}`}
      >
        <img
          src={getImageUrl(item.poster_path)}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-50"
        />
        
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        
        {/* Movie Info */}
        <div className="absolute bottom-0 inset-x-0 p-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <div className={`w-8 h-1 bg-${themeColor} mb-4 rounded-full group-hover:w-full transition-all duration-700`} />
            <h3 className="text-white font-black text-lg line-clamp-2 mb-2 group-hover:text-rose-500 transition-colors">
                {title}
            </h3>
            <div className="flex items-center gap-3 text-xs font-bold text-white/50">
                <div className="flex items-center gap-1 text-amber-400">
                    <Star size={12} className="fill-current" />
                    <span>{rating}</span>
                </div>
                <span>{date?.split('-')[0]}</span>
            </div>
        </div>

        {/* Action Button Reveal */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
            <button 
                onClick={handleToggleWatchlist}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 ${inWatchlist ? `bg-${themeColor} text-white` : 'bg-black/60 text-white'}`}
            >
                {inWatchlist ? <Check size={18} /> : <Plus size={18} />}
            </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative group cursor-pointer w-full aspect-video rounded-2xl overflow-hidden bg-[#0a0a0f] border border-white/5 shadow-2xl transition-all duration-300 ${className}`}
    >
      <img
        src={getImageUrl(item.backdrop_path || item.poster_path)}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-50"
      />

      <div className="absolute top-3 inset-x-3 flex justify-between items-start z-20">
        <div className="flex gap-2">
            <div className="px-2 py-1 rounded-lg glass text-[9px] font-black uppercase tracking-tighter text-white flex items-center gap-1 border border-white/10">
                <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor} animate-pulse`} />
                {item.media_type === 'movie' ? 'Movie' : 'Series'}
            </div>
            <div className="px-2 py-1 rounded-lg glass text-[9px] font-bold text-amber-400 flex items-center gap-1 border border-white/10">
                <Star size={10} className="fill-current" />
                <span>{rating}</span>
            </div>
        </div>
        <button 
            onClick={handleToggleWatchlist}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border border-white/10 backdrop-blur-md ${inWatchlist ? `bg-${themeColor} text-white` : 'bg-black/40 text-white hover:bg-white/20'}`}
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
                <h3 className="text-white font-bold text-sm md:text-base line-clamp-1 group-hover:text-rose-500 transition-colors">
                    {title}
                </h3>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePlay}
                        className={`flex-1 h-10 rounded-xl bg-${themeColor} text-white flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/20`}
                    >
                        <Play size={14} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Watch Now</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-white/40 text-[9px] font-bold">
                        <Clock size={10} />
                        <span>{date?.split('-')[0]}</span>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`absolute bottom-0 left-0 h-[3px] bg-${themeColor} transition-all duration-500 w-0 group-hover:w-full`} />
    </motion.div>
  );
};

export default React.memo(MediaCard);
