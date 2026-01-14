import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import { Heart, PlayCircle } from 'lucide-react';
import TvButton from '../components/TvButton';

const Watchlist: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<ContentItem[]>([]);

  useEffect(() => {
    const loadWatchlist = () => {
      // Cast to ContentItem[] as the service currently returns Movie[]
      setWatchlist(watchlistService.getWatchlist() as unknown as ContentItem[]);
    };

    loadWatchlist();

    const handleWatchlistUpdate = () => {
      loadWatchlist();
    };

    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, [user]); // Reload when user changes

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-20 pb-24 md:pl-24 md:pt-12 md:pr-12 md:pb-12">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-3 md:gap-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">My List</h1>
          <span className="bg-white/10 border border-white/10 text-gray-300 text-xs md:text-sm font-bold px-3 py-1 rounded-full">
            {watchlist.length}
          </span>
        </div>
        {user && (
           <span className="hidden md:block text-gray-400 text-sm">List for <span className="text-white font-semibold">{user.username}</span></span>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] md:h-[60vh] text-gray-400 animate-in fade-in duration-700">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
             <Heart size={40} className="text-gray-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Your list is empty</h2>
          <p className="text-base md:text-lg text-center max-w-md mb-8 text-gray-500">
            {user 
              ? "Start building your personalized library by adding movies and TV shows you want to watch."
              : "Items added here will be saved to your device. Sign in to sync your list across devices."}
          </p>
          <TvButton 
            variant="primary" 
            onClick={() => navigate('/')}
            icon={<PlayCircle size={20} />}
          >
            Discover Content
          </TvButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {watchlist.map((item, index) => {
             const type = item.media_type || 'movie';
             return (
              <MovieCard 
                key={`${item.id}-${index}`} 
                movie={{...item, media_type: type}} 
                onClick={() => navigate(`/details/${type}/${item.id}`)} 
                className="w-full h-full aspect-[2/3]"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;