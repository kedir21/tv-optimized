import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentItem } from '../types';
import { api, getPosterUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { Star, Heart, Check, Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  movie: ContentItem;
  onClick: () => void;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, className = '' }) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const title = 'title' in movie ? movie.title : (movie as any).name;
  const date = 'release_date' in movie ? movie.release_date : (movie as any).first_air_date;

  useEffect(() => {
    const checkStatus = async () => {
      const exists = await watchlistService.isInWatchlist(movie.id);
      setInWatchlist(exists);
    };

    checkStatus();
    window.addEventListener('watchlist-updated', checkStatus);
    return () => window.removeEventListener('watchlist-updated', checkStatus);
  }, [movie.id, user]);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setInWatchlist(prev => !prev);
    await watchlistService.toggleWatchlist(movie);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${movie.id}?type=${movie.media_type || 'movie'}`);
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative group cursor-pointer rounded-xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0 w-[40vw] sm:w-[150px] md:w-[180px] lg:w-[220px] aspect-[2/3] ${className}`}
    >
      <img
        src={getPosterUrl(movie.poster_path)}
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
            className="absolute inset-0 z-10 flex flex-col justify-end p-4 bg-gradient-to-t from-black via-black/40 to-transparent shadow-[inset_0_-20px_40px_rgba(0,0,0,0.8)]"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white font-semibold text-sm md:text-base line-clamp-2 mb-3 drop-shadow-lg"
            >
              {title}
            </motion.h3>

            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={handlePlay}
                className="flex-1 h-9 rounded-lg bg-white text-black flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-colors duration-200 shadow-xl"
              >
                <Play size={14} className="fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">Play</span>
              </button>
              <button 
                onClick={handleToggleWatchlist}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border border-white/10 ${inWatchlist ? 'bg-rose-500 border-rose-500 text-white' : 'bg-black/40 hover:bg-white/20 text-white'}`}
              >
                {inWatchlist ? <Check size={16} /> : <Heart size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-white/60">
               <div className="flex items-center gap-1.5 text-amber-400">
                  <Star size={11} className="fill-current" />
                  <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
               </div>
               <span>{date ? date.split('-')[0] : ''} • {movie.media_type?.toUpperCase()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Badge */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-20">
        {movie.media_type === 'tv' && (
          <div className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white uppercase tracking-widest">
            TV
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(MovieCard);
