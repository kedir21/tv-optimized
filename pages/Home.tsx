
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { Movie, ContentItem } from '../types';
import Row from '../components/Row';
import TvButton from '../components/TvButton';
import { Play, Info } from 'lucide-react';

import Meta from '../components/Meta';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);

  const [trending, setTrending] = useState<Movie[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [popular, setPopular] = useState<Movie[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [loadingTopRated, setLoadingTopRated] = useState(true);

  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    // Parallel fetching for speed
    const fetchAll = async () => {
      try {
        const [trendingData, popularData, topRatedData] = await Promise.all([
          api.getTrending(),
          api.getPopular(),
          api.getTopRated()
        ]);

        setTrending(trendingData);
        if (trendingData.length > 0) setHeroMovie(trendingData[0]);
        setLoadingTrending(false);

        setPopular(popularData);
        setLoadingPopular(false);

        setTopRated(topRatedData);
        setLoadingTopRated(false);
      } catch (e) {
        console.error(e);
        setLoadingTrending(false);
        setLoadingPopular(false);
        setLoadingTopRated(false);
      }
    };

    fetchAll();

    // Initial fetch of local data
    const fetchLocalData = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as Movie[]);
    };
    fetchLocalData();

    // Listen for updates
    const handleWatchlistUpdate = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as Movie[]);
    };

    window.addEventListener('watchlist-updated', handleWatchlistUpdate);

    return () => {
      window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
    };
  }, [user]);

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

  const goToDetails = (item: ContentItem) => {
    navigate(`/details/${item.media_type || 'movie'}/${item.id}`, { state: { movie: item } });
  };

  return (
    <main className="min-h-screen pb-24 md:pb-28 bg-slate-950">
      <Meta
        title="Home"
        description="Explore trending, popular, and top-rated movies and TV shows. Start streaming your favorite content now on K-Flix."
      />

      {/* Hero Section - Only render if we have data, no skeleton */}
      {heroMovie && (
        <section className="relative h-[70vh] md:h-[85vh] w-full mb-8 group animate-in fade-in duration-1000" aria-labelledby="hero-title">
          {/* Backdrop */}
          <div className="absolute inset-0">
            <img
              src={getImageUrl(heroMovie.backdrop_path)}
              alt={`${heroMovie.title} background`}
              className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 max-w-4xl">
            <h1 id="hero-title" className="text-4xl md:text-7xl font-bold text-white mb-2 md:mb-4 drop-shadow-2xl leading-tight tracking-tight">
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
                onClick={() => goToDetails(heroMovie)}
                className="px-6 py-3 text-base md:px-8 md:py-4 md:text-lg shadow-xl shadow-white/5"
                aria-label={`View details for ${heroMovie.title}`}
              >
                Details
              </TvButton>
              <TvButton
                variant="glass"
                icon={<Info size={20} />}
                onClick={() => goToDetails(heroMovie)}
                className="px-6 py-3 text-base md:px-8 md:py-4 md:text-lg"
                aria-label="More information"
              >
                More Info
              </TvButton>
            </div>
          </div>
        </section>
      )}

      {/* Rows */}
      <div className={`space-y-4 md:space-y-8 relative z-20 ${heroMovie ? '-mt-16 md:-mt-24' : 'pt-24'}`}>

        {watchlist.length > 0 && (
          <section aria-label="My Watchlist">
            <Row title={`My List ${user ? `(${user.username})` : ''}`} items={watchlist} onItemSelect={goToDetails} />
          </section>
        )}

        <section aria-label="Trending Movies and TV Shows">
          <Row title="Trending Now" items={trending} isLoading={loadingTrending} onItemSelect={goToDetails} />
        </section>

        <section aria-label="Popular Movies">
          <Row title="Popular Movies" items={popular} isLoading={loadingPopular} onItemSelect={goToDetails} />
        </section>

        <section aria-label="Top Rated Content">
          <Row title="Top Rated" items={topRated} isLoading={loadingTopRated} onItemSelect={goToDetails} />
        </section>
      </div>
    </main>
  );
};

export default Home;
