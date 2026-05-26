import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, getImageUrl } from '../services/api';
import { TvShow, Genre } from '../types';
import MediaCard from '../components/MediaCard';
import { MediaCardSkeleton } from '../components/Skeletons';
import { useNavigate } from 'react-router-dom';
import Meta from '../components/Meta';
import { CinematicBackground } from '../components/CinematicBackground';
import { ChevronDown, Globe, Play, Info, Star, Tv, Radio, Cpu, Layers, Filter } from 'lucide-react';

const COUNTRIES = [
  { code: 'ALL', name: 'Global Network' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
];

const TvShows: React.FC = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState<TvShow[]>([]);
  const [featuredShow, setFeaturedShow] = useState<TvShow | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, { rootMargin: '200px' });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    api.getGenres('tv').then(g => setGenres([{ id: 0, name: 'System All' }, ...g]));
    api.getPopularTv().then(trending => {
        if (trending.length > 0) setFeaturedShow(trending[0]);
    });
  }, []);

  useEffect(() => {
    setShows([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre, selectedCountry]);

  useEffect(() => {
    const fetchShows = async () => {
      if (loading) return;
      setLoading(true);
      try {
        const newShows = await api.discoverTvShows(page, selectedGenre, 'popularity.desc', undefined, selectedCountry);
        if (newShows.length === 0) {
          setHasMore(false);
        } else {
          setShows(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const uniqueNew = newShows.filter(s => !existingIds.has(s.id));
            return page === 1 ? newShows : [...prev, ...uniqueNew];
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchShows();
  }, [page, selectedGenre, selectedCountry]);

  return (
    <div className="relative min-h-screen bg-[#040406]">
      <CinematicBackground />
      <Meta title="TV Shows | K-Flix" />

      {/* Unified Premium Hero */}
      <AnimatePresence>
        {featuredShow && selectedGenre === 0 && selectedCountry === 'ALL' && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[80vh] w-full overflow-hidden flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={getImageUrl(featuredShow.backdrop_path)} 
                alt={featuredShow.name}
                className="w-full h-full object-cover scale-110 blur-[4px] opacity-40"
              />
              <div className="absolute inset-0 bg-[#040406]/80" />
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#040406] to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl flex items-center gap-2">
                            <Radio size={12} className="text-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Global Broadcast</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                            <Star size={14} className="fill-current" />
                            <span>{featuredShow.vote_average.toFixed(1)}</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-display font-black text-white mb-6 tracking-tighter leading-tight text-gradient">
                        {featuredShow.name}
                    </h1>
                    
                    <p className="text-base md:text-lg text-white/50 mb-10 line-clamp-3 font-medium leading-relaxed max-w-2xl bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/5">
                        {featuredShow.overview}
                    </p>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(`/watch/${featuredShow.id}?type=tv`)}
                            className="h-14 px-10 rounded-2xl bg-rose-500 text-white font-bold flex items-center gap-3 hover:bg-rose-600 transition-all hover:shadow-[0_0_40px_rgba(225,29,72,0.4)] active:scale-95"
                        >
                            <Play size={20} className="fill-current" />
                            <span className="uppercase tracking-widest text-xs font-black">Execute Stream</span>
                        </button>
                        <button 
                            onClick={() => navigate(`/details/tv/${featuredShow.id}`)}
                            className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center gap-3 hover:bg-white/10 transition-all backdrop-blur-md active:scale-95"
                        >
                            <Info size={20} />
                            <span className="uppercase tracking-widest text-xs font-black">System Logs</span>
                        </button>
                    </div>
                </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pb-40">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-16 border-b border-white/5 mb-16">
            <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <Layers className="text-rose-500" size={24} />
                </div>
                <div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                        {selectedGenre === 0 ? 'Digital Series' : genres.find(g => g.id === selectedGenre)?.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Cpu size={12} className="text-white/20" />
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Matrix v4.2.0</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group">
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="appearance-none bg-[#0a0a0f] border border-white/5 rounded-xl pl-10 pr-12 py-3.5 text-xs font-bold text-white/50 uppercase tracking-widest outline-none focus:border-rose-500/30 hover:text-white transition-all cursor-pointer shadow-2xl"
                    >
                        {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-[#050507]">{c.name}</option>)}
                    </select>
                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none group-hover:text-rose-500 transition-colors" />
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                </div>
            </div>
        </header>

        {/* Unified Genre Nav */}
        <nav className="flex gap-2 min-h-[60px] overflow-x-auto no-scrollbar mb-16 p-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-3xl relative">
            <div className="flex items-center px-4 border-r border-white/5 mr-2">
                <Filter size={14} className="text-white/20" />
            </div>
            {genres.map((genre, idx) => (
                <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`shrink-0 px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all relative ${selectedGenre === genre.id
                        ? 'text-white'
                        : 'text-white/30 hover:text-white hover:bg-white/5'
                    }`}
                >
                    {selectedGenre === genre.id && (
                        <motion.div 
                            layoutId="activeTvGenre"
                            className="absolute inset-0 bg-[#0a0a0f] border border-white/10 shadow-xl"
                            style={{ borderRadius: 'inherit' }}
                        />
                    )}
                    <span className="relative z-10">{genre.name}</span>
                </button>
            ))}
        </nav>

        {/* Compact Unified Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
                {shows.map((show, index) => (
                    <MediaCard
                        key={`${show.id}-${index}`}
                        item={{ ...show, media_type: 'tv' }}
                        onClick={() => navigate(`/details/tv/${show.id}`)}
                    />
                ))}
                
                {/* Skeletons while loading more */}
                {loading && [...Array(8)].map((_, i) => (
                    <MediaCardSkeleton key={`skeleton-${i}`} />
                ))}
            </AnimatePresence>
            
            {/* Safe intersection trigger for performance */}
            {hasMore && <div ref={lastElementRef} className="h-20 col-span-full" />}
        </div>

        {!hasMore && shows.length > 0 && (
            <div className="text-center py-20 border-t border-white/5 mt-20">
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">System End</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default TvShows;

