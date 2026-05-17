
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import { Heart, PlayCircle } from 'lucide-react';
import TvButton from '../components/TvButton';


import Meta from '../components/Meta';

const Watchlist: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<ContentItem[]>([]);

  useEffect(() => {
    const loadWatchlist = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as unknown as ContentItem[]);
    };

    loadWatchlist();

    const handleWatchlistUpdate = () => {
      loadWatchlist();
    };

    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, [user]);

  return (
    <main className="min-h-screen px-4 pt-16 pb-24 md:px-10 md:pt-10 md:pb-28" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Meta
        title="My Watchlist"
        description="Your personal collection of movies and TV shows to watch later on K-Flix."
      />
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">My List</h1>
          <span className="bg-white/[0.06] text-white/50 text-xs font-medium px-2.5 py-1 rounded-lg" aria-label={`${watchlist.length} items in list`}>
            {watchlist.length}
          </span>
        </div>
        {user && (
          <span className="hidden md:block text-white/30 text-xs">List for <span className="text-white/60 font-medium">{user.username}</span></span>
        )}
      </header>

      {watchlist.length === 0 ? (
        <section className="flex flex-col items-center justify-center h-[50vh] md:h-[60vh] animate-fade-in" role="status">
          <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mb-5">
            <Heart size={32} className="text-white/15" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your list is empty</h2>
          <p className="text-sm text-white/35 text-center max-w-sm mb-6">
            {user
              ? "Start building your library by adding movies and shows you want to watch."
              : "Items added here will be saved locally. Sign in to sync across devices."}
          </p>
          <TvButton
            variant="primary"
            onClick={() => navigate('/')}
            icon={<PlayCircle size={18} />}
            aria-label="Discover content"
          >
            Discover Content
          </TvButton>
        </section>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 animate-fade-in" aria-label="Your watchlist content">
          {watchlist.map((item, index) => {
            const type = item.media_type || 'movie';
            return (
              <MovieCard
                key={`${item.id}-${index}`}
                movie={{ ...item, media_type: type } as ContentItem}
                onClick={() => navigate(`/details/${type}/${item.id}`)}
                className="w-full h-full aspect-[2/3]"
              />
            );
          })}
        </section>
      )}
    </main>
  );
};

export default Watchlist;
