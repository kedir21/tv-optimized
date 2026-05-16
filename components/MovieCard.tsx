import React, { useState, useEffect } from 'react';
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
  const { user } = useAuth(); // Triggers re-render on user change
  const navigate = useNavigate();

  // Normalize title/name
  const title = 'title' in movie ? movie.title : (movie as any).name;
  const date = 'release_date' in movie ? movie.release_date : (movie as any).first_air_date;

  useEffect(() => {
    // Check status whenever movie ID or User changes
    const checkStatus = async () => {
      const exists = await watchlistService.isInWatchlist(movie.id);
      setInWatchlist(exists);
    };

    checkStatus();
    window.addEventListener('watchlist-updated', checkStatus);
    return () => window.removeEventListener('watchlist-updated', checkStatus);
  }, [movie.id, user]);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // Optimistic UI update
    setInWatchlist(prev => !prev);
    await watchlistService.toggleWatchlist(movie);
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // View Transition Logic
    if ('startViewTransition' in document) {
      const img = (e.currentTarget as HTMLElement).querySelector('img');
      if (img) {
        (img.style as any).viewTransitionName = 'shared-poster';
        const transition = (document as any).startViewTransition(() => {
          onClick();
        });

        transition.finished.finally(() => {
          (img.style as any).viewTransitionName = '';
        });
        return;
      }
    }
    onClick();
  };

  const releaseTime = date ? new Date(date).getTime() : 0;
  const now = Date.now();
  const daysSinceRelease = (now - releaseTime) / (1000 * 60 * 60 * 24);
  const isRecent = date && daysSinceRelease >= 0 && daysSinceRelease <= 45;

  const [showInTheaters, setShowInTheaters] = useState(isRecent);

  useEffect(() => {
    setShowInTheaters(isRecent);
    
    if (isRecent) {
      let isMounted = true;
      const checkNetflix = async () => {
        try {
          // Check if available on Netflix
          const details: any = await api.getDetails(movie.id.toString(), movie.media_type || 'movie');
          const providers = details["watch/providers"]?.results?.US;
          const isNetflix = providers?.flatrate?.some((p: any) => p.provider_name.toLowerCase().includes('netflix'));
          
          if (isMounted && isNetflix) {
            setShowInTheaters(false);
          }
        } catch (e) {
          console.warn('Failed to check netflix availability', e);
        }
      };
      checkNetflix();
      return () => { isMounted = false; };
    }
  }, [movie.id, movie.media_type, isRecent]);

  // Default width is smaller on mobile (w-28 or w-32) and scales up
  const baseClasses = "focusable tv-focus relative flex-shrink-0 w-[30vw] min-w-[7rem] max-w-[8rem] sm:max-w-none sm:w-36 md:w-48 lg:w-56 aspect-[2/3] rounded-2xl md:rounded-[1.5rem] overflow-hidden cursor-pointer group/card bg-black/40 border border-white/10 focus:border-cyan-400 focus:z-20 shadow-md active:scale-95 transition-all duration-300 md:duration-[500ms] md:ease-[cubic-bezier(0.25,1,0.5,1)] select-none touch-pan-y md:hover:z-50 md:hover:shadow-[0_0_30px_rgba(6,182,212,0.3),0_20px_40px_rgba(0,0,0,0.8)] md:hover:ring-1 md:hover:ring-cyan-400/50 transform-gpu will-change-transform md:hover:-translate-y-2 lg:hover:-translate-y-4";

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleClick(e);
      }}
    >
      <img
        src={getPosterUrl(movie.poster_path)}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 md:duration-700 md:group-hover/card:scale-110"
      />

      {/* Badges (Type & In Theaters) */}
      <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 flex flex-col gap-1 items-start pointer-events-none z-10">
        {movie.media_type === 'tv' && (
          <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
            TV
          </span>
        )}
        {showInTheaters && (
          <span className="px-1.5 py-0.5 bg-red-500/80 backdrop-blur-md rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">
            In Theaters
          </span>
        )}
      </div>

      {/* Overlay info - Hidden on mobile entirely or simplified, visible on tap/hover on desktop */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent opacity-0 md:group-focus/card:opacity-100 md:group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 md:p-5 pointer-events-none translate-y-4 md:group-hover/card:translate-y-0 md:group-focus/card:translate-y-0 z-20 hidden md:flex">
        <h3 className="text-white font-black text-sm md:text-base line-clamp-2 leading-tight mb-3 drop-shadow-lg">{title}</h3>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mb-3 pointer-events-auto transform translate-y-4 opacity-0 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 transition-all duration-500 delay-100">
           <button onClick={(e) => { e.stopPropagation(); navigate(`/watch/${movie.id}?type=${movie.media_type || 'movie'}`); }} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-cyan-400 hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]" title="Play">
               <Play size={16} className="fill-current ml-0.5" />
           </button>
           <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 hover:scale-110 transition-all border border-white/20" title="More Info">
               <Info size={16} />
           </button>
           <button onClick={handleToggleWatchlist} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all border border-white/20 backdrop-blur-md ${inWatchlist ? 'bg-red-600/90 text-white border-transparent' : 'bg-white/20 text-white hover:bg-white/40'}`} title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}>
               {inWatchlist ? <Check size={16} /> : <Heart size={16} className="text-white" />}
           </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-yellow-400 text-xs md:text-sm font-bold bg-black/50 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
            <Star size={12} className="md:w-3.5 md:h-3.5 fill-current" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          <span className="text-xs md:text-sm text-white/80 font-bold bg-black/50 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">{date ? date.split('-')[0] : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MovieCard);
