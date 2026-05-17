
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { Movie, ContentItem } from '../types';
import Row from '../components/Row';
import { Play, Info, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetworkSection } from '../components/NetworkSection';
import Meta from '../components/Meta';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heroMovie, setHeroMovie] = useState<ContentItem | null>(null);

  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [popular, setPopular] = useState<Movie[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [loadingTopRated, setLoadingTopRated] = useState(true);

  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  const [popularTv, setPopularTv] = useState<ContentItem[]>([]);
  const [loadingPopularTv, setLoadingPopularTv] = useState(true);

  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendingData, popularData, topRatedData, upcomingData, popularTvData] = await Promise.all([
          api.getTrending(),
          api.getPopular(),
          api.getTopRated(),
          api.getUpcoming(),
          api.getPopularTv()
        ]);

        setTrending(trendingData);
        if (trendingData.length > 0) setHeroMovie(trendingData[0]);
        setLoadingTrending(false);

        setPopular(popularData);
        setLoadingPopular(false);

        setTopRated(topRatedData);
        setLoadingTopRated(false);

        setUpcoming(upcomingData);
        setLoadingUpcoming(false);

        setPopularTv(popularTvData as any);
        setLoadingPopularTv(false);
      } catch (e) {
        console.error(e);
        setLoadingTrending(false);
        setLoadingPopular(false);
        setLoadingTopRated(false);
      }
    };

    fetchAll();

    const fetchLocalData = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as Movie[]);
    };
    fetchLocalData();

    const handleWatchlistUpdate = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as Movie[]);
    };

    window.addEventListener('watchlist-updated', handleWatchlistUpdate);

    return () => {
      window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
    };
  }, [user]);

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
    const type = item.media_type || 'movie';
    navigate(`/details/${type}/${item.id}`);
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-24 overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <Meta
        title="Home"
        description="Explore trending, popular, and top-rated movies and TV shows. Start streaming your favorite content now on K-Flix."
      />

      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-[80vh] lg:h-[90vh] w-full mb-8 group overflow-hidden" aria-labelledby="hero-title">
          {/* Backdrop */}
          <AnimatePresence mode="wait">
            <motion.div
              key={heroMovie.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 z-0"
            >
              <img
                src={getImageUrl(heroMovie.backdrop_path)}
                alt={`${(heroMovie as any).title || (heroMovie as any).name} background`}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 h-full w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-end lg:items-center justify-between pb-10 lg:pb-0 px-5 md:px-10 lg:px-14 gap-8">
            {/* Hero Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-end pt-32 lg:pt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroMovie.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <h1 id="hero-title" className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight leading-[1.1]">
                    {(heroMovie as any).title || (heroMovie as any).name}
                  </h1>
                  
                  <div className="flex items-center gap-3 mb-5 text-white/50 font-medium text-sm">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {heroMovie.vote_average?.toFixed(1)}
                    </span>
                    <span className="text-white/20">•</span>
                    <span>{(heroMovie as any).release_date ? (heroMovie as any).release_date.split('-')[0] : (heroMovie as any).first_air_date?.split('-')[0]}</span>
                    <span className="text-white/20">•</span>
                    <span className="uppercase text-xs tracking-wider">{heroMovie.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                  </div>

                  <p className="text-white/45 text-sm md:text-base line-clamp-3 mb-8 max-w-xl leading-relaxed">
                     {heroMovie.overview || "No overview available."}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      id="hero-play-btn"
                      onClick={() => navigate(`/watch/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`)}
                      className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-[var(--bg-primary)] font-bold text-sm hover:bg-white/90 active:scale-[0.97] transition-all duration-200 shadow-lg"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>Watch Now</span>
                    </button>
                    <button
                      onClick={() => goToDetails(heroMovie)}
                      className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/8 text-white/80 font-medium text-sm border border-white/[0.06] hover:bg-white/12 hover:text-white active:scale-[0.97] transition-all duration-200"
                    >
                      <Info className="w-5 h-5" />
                      <span>More Info</span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Trending Cards (Desktop) */}
            <div className="hidden lg:flex flex-col items-end justify-center w-1/2 pt-16">
              <div className="flex items-center gap-3 mb-5">
                 <div className="h-px w-8 bg-white/10" />
                 <h3 className="text-white/30 font-medium text-xs uppercase tracking-[0.2em]">Trending This Week</h3>
              </div>
              <div className="flex justify-end gap-2.5 xl:gap-4 w-full overflow-visible">
                {trending.slice(0, 5).map((movie) => (
                  <div
                    key={movie.id}
                    onMouseEnter={() => setHeroMovie(movie)}
                    onClick={() => goToDetails(movie)}
                    className={`relative flex-shrink-0 w-24 xl:w-32 2xl:w-40 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ease-out transform ${
                      heroMovie.id === movie.id 
                      ? 'ring-2 ring-white/30 scale-110 shadow-[0_16px_40px_rgba(0,0,0,0.5)] -translate-y-3 z-20 opacity-100' 
                      : 'ring-1 ring-white/[0.04] hover:ring-white/10 opacity-40 hover:opacity-70 z-10'
                    }`}
                  >
                    <img 
                      src={getPosterUrl(movie.poster_path)} 
                      alt={(movie as any).title || (movie as any).name} 
                      className="w-full h-full object-cover" 
                    />
                    {heroMovie.id === movie.id && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-3">
                        <Play className="w-5 h-5 text-white fill-current drop-shadow-md" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Rows */}
      <div className={`space-y-2 md:space-y-4 relative z-20 ${heroMovie ? '-mt-8 md:-mt-16' : 'pt-20'}`}>

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

        <section aria-label="Upcoming Movies">
          <Row title="Upcoming Movies" items={upcoming} isLoading={loadingUpcoming} onItemSelect={goToDetails} />
        </section>

        <section aria-label="Popular TV Shows">
          <Row title="Popular TV Shows" items={popularTv} isLoading={loadingPopularTv} onItemSelect={goToDetails} />
        </section>

        <NetworkSection />
      </div>
    </motion.main>
  );
};

export default Home;
