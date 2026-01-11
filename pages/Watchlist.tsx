import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistService } from '../services/watchlist';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import { Heart } from 'lucide-react';

const Watchlist: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<ContentItem[]>([]);

  useEffect(() => {
    const loadWatchlist = () => {
      // Cast to ContentItem[] as the service currently returns Movie[] but we are storing both types in practice
      setWatchlist(watchlistService.getWatchlist() as unknown as ContentItem[]);
    };

    loadWatchlist();

    const handleWatchlistUpdate = () => {
      loadWatchlist();
    };

    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-20 pb-24 md:pl-24 md:pt-8 md:pr-8 md:pb-12">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">My List</h1>
        <span className="bg-red-600 text-white text-xs md:text-sm font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full">
          {watchlist.length}
        </span>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] md:h-[60vh] text-gray-400">
          <Heart size={48} className="md:w-16 md:h-16 mb-4 md:mb-6 opacity-20" />
          <h2 className="text-xl md:text-2xl font-semibold mb-2">Your list is empty</h2>
          <p className="text-sm md:text-base text-center max-w-xs md:max-w-md">Movies and TV shows you add to your watchlist will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
          {watchlist.map((item, index) => {
             // Handle legacy items that might not have media_type set
             const type = item.media_type || 'movie';
             return (
              <MovieCard 
                key={`${item.id}-${index}`} 
                movie={{...item, media_type: type}} 
                onClick={() => navigate(`/details/${type}/${item.id}`)} 
                className="w-full h-full"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;