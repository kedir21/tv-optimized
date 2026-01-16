
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { Movie } from '../types';
import Row from '../components/Row';
import TvButton from '../components/TvButton';
import { Play, Info } from 'lucide-react';
import { HeroSkeleton } from '../components/Skeletons';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Ensures re-render on auth change
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  
  const [popular, setPopular] = useState<Movie[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await api.getTrending();
        setTrending(data);
        if (data.length > 0) setHeroMovie(data[0]);
      } catch (e) { console.error(e); } 
      finally { setLoadingTrending(false); }
    };

    const fetchPopular = async () => {
      try {
        const data = await api.getPopular();
        setPopular(data);
      } catch (e) { console.error(e); } 
      finally { setLoadingPopular(false); }
    };

    const fetchTopRated = async () => {
      try {
        const data = await api.getTopRated();
        setTopRated(data);
      } catch (e) { console.error(e); } 
      finally { setLoadingTopRated(false); }
    };

    fetchTrending();
    fetchPopular();
    fetchTopRated();
    
    // Initial load of watchlist based on current user (or guest)
    const fetchWatchlist = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as Movie[]);
    };
    fetchWatchlist();

    // Listen for watchlist updates
    const handleWatchlistUpdate = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as Movie[]);
    };
    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, [user]); // Re-fetch watchlist when user changes

  // Auto focus the Play button on load
  useEffect(() => {
    if (heroMovie) {
        const timer = setTimeout(() => {
            const playBtn = document.getElementById('hero-play-btn');
            if (playBtn) playBtn.focus();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [heroMovie]);

  // Helper for navigation
  const goToDetails = (id: number) => navigate(`/details/movie/${id}`);

  return (
    <div className="min-h-screen pb-24 md:pb-20 md:pl-24 bg-slate-950">
      {/* Hero Section */}
      {loadingTrending && !heroMovie ? (
         <HeroSkeleton />
      ) : heroMovie && (
        <div className="relative h-[70vh] md:h-[85vh] w-full mb-8 group">
          {/* Backdrop */}
          <div className="absolute inset-0">
            <img 
              src={getImageUrl(heroMovie.backdrop_path)} 
              alt={heroMovie.title}
              className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 max-w-4xl">
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-2 md:mb-4 drop-shadow-2xl leading-tight tracking-tight">
              {heroMovie.title}
            </h1>
            <p className="text-gray-300 text-sm md:text-xl line-clamp-3 mb-8 md:mb-10 max-w-2xl drop-shadow-md leading-relaxed font-light">
              {heroMovie.overview}
            </p>
            
            <div className="flex gap-4">
              <TvButton 
                id="hero-play-btn"
                variant="primary" 
                icon={<Play fill="currentColor" size={20} />}
                onClick={() => goToDetails(heroMovie.id)}
                className="px-6 py-3 text-base md:px-8 md:py-4 md:text-lg shadow-xl shadow-white/5"
              >
                Details
              </TvButton>
              <TvButton 
                variant="glass" 
                icon={<Info size={20} />}
                onClick={() => goToDetails(heroMovie.id)}
                className="px-6 py-3 text-base md:px-8 md:py-4 md:text-lg"
              >
                More Info
              </TvButton>
            </div>
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="space-y-4 md:space-y-8 -mt-16 md:-mt-24 relative z-20">
        {watchlist.length > 0 && (
          <Row title={`My List ${user ? `(${user.username})` : ''}`} items={watchlist} onItemSelect={(id) => {
             const item = watchlist.find(m => m.id === id);
             const type = item?.media_type || 'movie';
             navigate(`/details/${type}/${id}`);
          }} />
        )}
        <Row title="Trending Now" items={trending} isLoading={loadingTrending} onItemSelect={goToDetails} />
        <Row title="Popular Movies" items={popular} isLoading={loadingPopular} onItemSelect={goToDetails} />
        <Row title="Top Rated" items={topRated} isLoading={loadingTopRated} onItemSelect={goToDetails} />
      </div>
    </div>
  );
};

export default Home;
