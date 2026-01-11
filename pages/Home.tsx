import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { Movie } from '../types';
import Row from '../components/Row';
import TvButton from '../components/TvButton';
import { Play, Info } from 'lucide-react';
import { Skeleton } from '../components/Skeletons';

const Home: React.FC = () => {
  const navigate = useNavigate();
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
    setWatchlist(watchlistService.getWatchlist());

    // Listen for watchlist updates
    const handleWatchlistUpdate = () => {
      setWatchlist(watchlistService.getWatchlist());
    };
    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, []);

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
    <div className="min-h-screen pb-24 md:pb-20 md:pl-20 bg-slate-950">
      {/* Hero Section */}
      {loadingTrending && !heroMovie ? (
         <div className="relative h-[70vh] md:h-[85vh] w-full mb-8 bg-gray-900 animate-pulse">
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-4xl">
              <Skeleton className="h-10 md:h-16 w-3/4 mb-4" />
              <Skeleton className="h-20 md:h-24 w-full mb-8" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32 md:h-14 md:w-40 rounded-lg" />
                <Skeleton className="h-12 w-32 md:h-14 md:w-40 rounded-lg" />
              </div>
            </div>
         </div>
      ) : heroMovie && (
        <div className="relative h-[70vh] md:h-[85vh] w-full mb-8">
          {/* Backdrop */}
          <div className="absolute inset-0">
            <img 
              src={getImageUrl(heroMovie.backdrop_path)} 
              alt={heroMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 max-w-4xl">
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg leading-tight">
              {heroMovie.title}
            </h1>
            <p className="text-gray-300 text-sm md:text-xl line-clamp-3 mb-6 md:mb-8 max-w-2xl drop-shadow-md">
              {heroMovie.overview}
            </p>
            
            <div className="flex gap-4">
              <TvButton 
                id="hero-play-btn"
                variant="primary" 
                icon={<Play fill="currentColor" size={20} />}
                onClick={() => goToDetails(heroMovie.id)}
                className="px-6 py-3 text-base md:px-8 md:py-4 md:text-lg"
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
      <div className="space-y-2 md:space-y-4 -mt-10 md:-mt-16 relative z-20">
        {watchlist.length > 0 && (
          <Row title="My Watchlist" movies={watchlist} onMovieSelect={(id) => {
             const item = watchlist.find(m => m.id === id);
             const type = item?.media_type || 'movie';
             navigate(`/details/${type}/${id}`);
          }} />
        )}
        <Row title="Trending Now" movies={trending} isLoading={loadingTrending} onMovieSelect={goToDetails} />
        <Row title="Popular Movies" movies={popular} isLoading={loadingPopular} onMovieSelect={goToDetails} />
        <Row title="Top Rated" movies={topRated} isLoading={loadingTopRated} onMovieSelect={goToDetails} />
      </div>
    </div>
  );
};

export default Home;