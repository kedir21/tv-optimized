import React, { useState, useEffect } from 'react';
import { ContentItem } from '../types';
import { getPosterUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { Star, Heart, Check } from 'lucide-react';

interface MovieCardProps {
  movie: ContentItem;
  onClick: () => void;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, className = '' }) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const { user } = useAuth(); // Triggers re-render on user change

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

  // Default width is smaller on mobile (w-32) and larger on tablet/desktop
  const baseClasses = "focusable tv-focus relative flex-shrink-0 w-36 md:w-48 lg:w-56 aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group bg-gray-800 border-2 border-transparent focus:border-white focus:z-20 shadow-lg hover:shadow-2xl transition-all duration-300";

  return (
    <div 
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick();
      }}
    >
      <img 
        src={getPosterUrl(movie.poster_path)} 
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110"
      />
      
      {/* Type Badge */}
      {movie.media_type === 'tv' && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
          TV
        </div>
      )}

      {/* Watchlist Indicator */}
      <button
        onClick={handleToggleWatchlist}
        className={`absolute top-2 right-2 p-1.5 md:p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 
          ${inWatchlist 
            ? 'bg-red-600/90 text-white opacity-100 scale-100' 
            : 'bg-black/40 text-white opacity-0 group-focus:opacity-100 group-hover:opacity-100 hover:bg-red-600 scale-90 group-hover:scale-100'
          }`}
        title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
      >
        {inWatchlist ? <Check size={14} className="md:w-4 md:h-4" /> : <Heart size={14} className="md:w-4 md:h-4" />}
      </button>

      {/* Overlay info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-focus:opacity-100 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4 pointer-events-none">
        <h3 className="text-white font-bold text-xs md:text-sm line-clamp-2 leading-tight mb-1">{title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-400 text-[10px] md:text-xs font-medium">
            <Star size={10} className="md:w-3 md:h-3 fill-current" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
          <span className="text-[10px] md:text-xs text-gray-300 font-medium">{date ? date.split('-')[0] : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;