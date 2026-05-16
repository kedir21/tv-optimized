
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { Movie, ContentItem } from '../types';
import Row from '../components/Row';
import TvButton from '../components/TvButton';
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
    // Parallel fetching for speed
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
    const type = item.media_type || 'movie';
    navigate(`/details/${type}/${item.id}`);
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-28 overflow-x-hidden bg-[#020617]"
    >
      <Meta
        title="Home"
        description="Explore trending, popular, and top-rated movies and TV shows. Start streaming your favorite content now on K-Flix."
      />

      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-[85vh] lg:h-[95vh] w-full mb-12 group overflow-hidden" aria-labelledby="hero-title">
          {/* Backdrop with Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={heroMovie.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
            >
              <img
                src={getImageUrl(heroMovie.backdrop_path)}
                alt={`${(heroMovie as any).title || (heroMovie as any).name} background`}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 h-full w-full max-w-[1800px] mx-auto flex flex-col lg:flex-row items-end lg:items-center justify-between pb-12 lg:pb-0 px-6 md:px-12 lg:px-16 gap-10">
            {/* Hero Content (Left) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-end pt-32 lg:pt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroMovie.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1 id="hero-title" className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] tracking-tighter leading-[1.1]">
                    {(heroMovie as any).title || (heroMovie as any).name}
                  </h1>
                  
                  <div className="flex items-center gap-3 mb-6 text-cyan-400 font-bold tracking-widest text-sm uppercase">
                    <span className="flex items-center gap-1 border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 rounded">
                      <Star className="w-4 h-4 fill-current" />
                      {heroMovie.vote_average?.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{(heroMovie as any).release_date ? (heroMovie as any).release_date.split('-')[0] : (heroMovie as any).first_air_date?.split('-')[0]}</span>
                    <span>•</span>
                    <span>{heroMovie.media_type === 'tv' ? 'TV SHOW' : 'MOVIE'}</span>
                  </div>

                  <p className="text-white/70 text-base md:text-xl line-clamp-3 mb-10 max-w-2xl drop-shadow-md leading-relaxed font-light">
                     {heroMovie.overview || "No overview available."}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      id="hero-play-btn"
                      onClick={() => navigate(`/watch/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`)}
                      className="flex items-center gap-3 px-8 py-4 rounded-full bg-cyan-500 text-[#020617] font-black hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                    >
                      <Play className="w-6 h-6 fill-current" />
                      <span>Watch Now</span>
                    </button>
                    <button
                      onClick={() => goToDetails(heroMovie)}
                      className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/10 text-white font-bold backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                      <Info className="w-6 h-6" />
                      <span>More Info</span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dynamic Movie Cards Carousel (Right) */}
            <div className="hidden lg:flex flex-col items-end justify-center w-1/2 pt-20">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-px w-12 bg-cyan-500" />
                 <h3 className="text-white/60 font-black uppercase tracking-[0.2em] text-sm">Trending This Week</h3>
              </div>
              <div className="flex justify-end gap-3 xl:gap-5 w-full overflow-visible">
                {trending.slice(0, 5).map((movie) => (
                  <div
                    key={movie.id}
                    onMouseEnter={() => setHeroMovie(movie)}
                    onClick={() => goToDetails(movie)}
                    className={`relative flex-shrink-0 w-28 xl:w-36 2xl:w-44 aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out transform ${
                      heroMovie.id === movie.id 
                      ? 'ring-4 ring-cyan-500 scale-110 shadow-[0_20px_50px_rgba(6,182,212,0.4)] -translate-y-4 z-20' 
                      : 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-105 opacity-50 hover:opacity-100 z-10 grayscale hover:grayscale-0'
                    }`}
                  >
                    <img 
                      src={getPosterUrl(movie.poster_path)} 
                      alt={(movie as any).title || (movie as any).name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${heroMovie.id === movie.id ? 'opacity-100' : 'opacity-0'}`}>
                      <Play className="w-8 h-8 text-cyan-400 fill-current mx-auto mb-2 drop-shadow-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Rows */}
      <div className={`space-y-4 md:space-y-6 relative z-20 ${heroMovie ? '-mt-16 md:-mt-24' : 'pt-24'}`}>

        {watchlist.length > 0 && (
          <section aria-label="My Watchlist" className="relative group/section">
            <Row title={`My List ${user ? `(${user.username})` : ''}`} items={watchlist} onItemSelect={goToDetails} />
            <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-700" />
          </section>
        )}

        <section aria-label="Trending Movies and TV Shows" className="relative group/section">
          <Row title="Trending Now" items={trending} isLoading={loadingTrending} onItemSelect={goToDetails} />
          <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-700" />
        </section>

        <section aria-label="Popular Movies" className="relative group/section">
          <Row title="Popular Movies" items={popular} isLoading={loadingPopular} onItemSelect={goToDetails} />
          <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-700" />
        </section>

        <section aria-label="Top Rated Content" className="relative group/section">
          <Row title="Top Rated" items={topRated} isLoading={loadingTopRated} onItemSelect={goToDetails} />
          <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-700" />
        </section>

        <section aria-label="Upcoming Movies" className="relative group/section">
          <Row title="Upcoming Movies" items={upcoming} isLoading={loadingUpcoming} onItemSelect={goToDetails} />
          <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-700" />
        </section>

        <section aria-label="Popular TV Shows" className="relative group/section">
          <Row title="Popular TV Shows" items={popularTv} isLoading={loadingPopularTv} onItemSelect={goToDetails} />
          <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-700" />
        </section>

        <NetworkSection />
      </div>
    </motion.main>
  );
};

export default Home;
