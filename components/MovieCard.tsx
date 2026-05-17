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

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
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

  return (
    <div
      className={`focusable tv-focus relative flex-shrink-0 w-[30vw] min-w-[7rem] max-w-[8rem] sm:max-w-none sm:w-36 md:w-44 lg:w-52 aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group/card bg-[var(--bg-card)] border border-white/[0.04] focus:border-rose-500/50 focus:z-20 active:scale-[0.97] transition-all duration-300 md:duration-400 select-none touch-pan-y md:hover:z-50 md:hover:border-white/[0.08] transform-gpu will-change-transform md:hover:-translate-y-2 md:hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] ${className}`}
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
        className="w-full h-full object-cover transition-transform duration-700 ease-out md:group-hover/card:scale-[1.06]"
      />

      {/* Subtle persistent bottom gradient for readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none md:hidden" />

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start pointer-events-none z-10">
        {movie.media_type === 'tv' && (
          <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-semibold uppercase tracking-wider text-white/80">
            TV
          </span>
        )}
        {showInTheaters && (
          <span className="px-2 py-0.5 bg-rose-500/80 backdrop-blur-md rounded-md text-[10px] font-semibold uppercase tracking-wider text-white">
            In Theaters
          </span>
        )}
      </div>

      {/* Hover overlay — desktop only */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-transparent opacity-0 md:group-focus/card:opacity-100 md:group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 md:p-5 pointer-events-none translate-y-3 md:group-hover/card:translate-y-0 md:group-focus/card:translate-y-0 z-20 hidden md:flex">
        <h3 className="text-white font-bold text-sm line-clamp-2 leading-snug mb-3">{title}</h3>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mb-3 pointer-events-auto transform translate-y-3 opacity-0 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 transition-all duration-400 delay-75">
           <button onClick={(e) => { e.stopPropagation(); navigate(`/watch/${movie.id}?type=${movie.media_type || 'movie'}`); }} className="w-9 h-9 rounded-full bg-white text-[var(--bg-primary)] flex items-center justify-center hover:bg-rose-500 hover:text-white hover:scale-110 transition-all duration-200 shadow-lg" title="Play">
               <Play size={14} className="fill-current ml-0.5" />
           </button>
           <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-200" title="More Info">
               <Info size={14} />
           </button>
           <button onClick={handleToggleWatchlist} className={`w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 backdrop-blur-md ${inWatchlist ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}>
               {inWatchlist ? <Check size={14} /> : <Heart size={14} />}
           </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            <Star size={11} className="fill-current" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          <span className="text-xs text-white/50 font-medium">{date ? date.split('-')[0] : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MovieCard);
