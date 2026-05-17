import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, getImageUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { Movie, ContentItem } from '../types';
import Row from '../components/Row';
import { Play, Info, Star, Plus, Check } from 'lucide-react';
import { NetworkSection } from '../components/NetworkSection';
import Meta from '../components/Meta';
import { CinematicBackground } from '../components/CinematicBackground';
import KDramaSection from '../components/KDrama/KDramaSection';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heroMovie, setHeroMovie] = useState<ContentItem | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [popularTv, setPopularTv] = useState<ContentItem[]>([]);
  const [loadingPopularTv, setLoadingPopularTv] = useState(true);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [trendingData, popularData, topRatedData, popularTvData] =
          await Promise.all([
            api.getTrending(),
            api.getPopular(),
            api.getTopRated(),
            api.getPopularTv(),
          ]);

        setTrending(trendingData);
        if (trendingData.length > 0) setHeroMovie(trendingData[0]);
        setPopular(popularData);
        setTopRated(topRatedData);
        setPopularTv(popularTvData as ContentItem[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTrending(false);
        setLoadingPopular(false);
        setLoadingTopRated(false);
        setLoadingPopularTv(false);
      }
    };

    fetchAll();

    const fetchWatchlist = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as Movie[]);
    };
    fetchWatchlist();

    const handleWatchlistUpdate = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as Movie[]);
    };

    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, [user]);

  useEffect(() => {
    if (heroMovie) {
      watchlistService.isInWatchlist(heroMovie.id).then(setInWatchlist);
    }
  }, [heroMovie]);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (heroMovie) {
      await watchlistService.toggleWatchlist(heroMovie);
      setInWatchlist(!inWatchlist);
    }
  };

  const goToDetails = (item: ContentItem) => {
    const type = item.media_type || 'movie';
    navigate(`/details/${type}/${item.id}`);
  };

  return (
    <div className="relative min-h-screen">
      <CinematicBackground heroBackdropPath={heroMovie?.backdrop_path} />
      
      <Meta 
        title="K-Flix | Stream Movies & TV" 
        description="Stream the latest movies and TV shows in high quality. Ultra-minimal cinematic experience."
      />

      <main className="relative z-10 w-full">
        {/* Fullscreen Hero */}
        {heroMovie && (
          <section className="relative h-screen w-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              key={heroMovie.id}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                  Trending Now
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                  <Star size={14} className="fill-current" />
                  {heroMovie.vote_average?.toFixed(1)}
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.95] tracking-tight text-gradient">
                {(heroMovie as Movie).title || (heroMovie as { name?: string }).name}
              </h1>

              <p className="text-base md:text-lg text-white/50 mb-10 line-clamp-3 max-w-2xl leading-relaxed">
                {heroMovie.overview}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/watch/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`)}
                  className="px-8 py-4 bg-white text-black rounded-2xl font-bold flex items-center gap-3 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-2xl hover:shadow-rose-500/20 active:scale-95"
                >
                  <Play size={20} className="fill-current" />
                  Play Now
                </button>
                <button
                  onClick={() => goToDetails(heroMovie)}
                  className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-white/10 transition-all duration-300 active:scale-95"
                >
                  <Info size={20} />
                  Details
                </button>
                <button
                  onClick={handleToggleWatchlist}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 transition-all duration-300 active:scale-95 ${inWatchlist ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  {inWatchlist ? <Check size={24} /> : <Plus size={24} />}
                </button>
              </div>
            </motion.div>
          </section>
        )}

        {/* Content Rows */}
        <div className="space-y-12 pb-24 -mt-10 relative">
          {watchlist.length > 0 && (
            <Row title="Continue Watching" items={watchlist} onItemSelect={goToDetails} />
          )}

          <Row 
            title="Trending" 
            items={trending} 
            isLoading={loadingTrending} 
            onItemSelect={goToDetails} 
          />

          <Row 
            title="Popular Movies" 
            items={popular} 
            isLoading={loadingPopular} 
            onItemSelect={goToDetails} 
          />

          <Row 
            title="Top Rated" 
            items={topRated} 
            isLoading={loadingTopRated} 
            onItemSelect={goToDetails} 
          />

          <Row 
            title="TV Shows" 
            items={popularTv} 
            isLoading={loadingPopularTv} 
            onItemSelect={goToDetails} 
          />

          <KDramaSection onItemSelect={(item) => goToDetails({ ...item, media_type: 'tv' } as ContentItem)} />
          
          <NetworkSection />
        </div>
      </main>
    </div>
  );
};

export default Home;
