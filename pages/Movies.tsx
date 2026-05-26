import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Movie, Genre } from '../types';
import MediaCard from '../components/MediaCard';
import { PortraitMediaCardSkeleton } from '../components/Skeletons';
import { ChevronDown, Globe, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Meta from '../components/Meta';
import { CinematicBackground } from '../components/CinematicBackground';

const COUNTRIES = [
  { code: 'ALL', name: 'Global Collections' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
];

const Movies: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
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
    }, { rootMargin: '400px' });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    api.getGenres('movie').then(g => setGenres([{ id: 0, name: 'All Movies' }, ...g]));
  }, []);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre, selectedCountry]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (loading) return;
      setLoading(true);
      try {
        const newMovies = await api.discoverMovies(page, selectedGenre, 'popularity.desc', { country: selectedCountry });
        if (newMovies.length === 0) {
          setHasMore(false);
        } else {
          setMovies(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNew = newMovies.filter(m => !existingIds.has(m.id));
            return page === 1 ? newMovies : [...prev, ...uniqueNew];
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchMovies();
  }, [page, selectedGenre, selectedCountry]);

  return (
    <div className="relative min-h-screen bg-[#040406]">
      <CinematicBackground />
      <Meta title="Movies | K-Flix" />

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pb-40">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-20 border-b border-white/5 mb-12">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-rose-500 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.5)]" />
                    <h2 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter">
                        {selectedGenre === 0 ? 'Digital Cinema' : genres.find(g => g.id === selectedGenre)?.name}
                    </h2>
                </div>
                <p className="text-white/20 text-xs font-bold uppercase tracking-[0.4em] ml-5">Premiere Collections Available</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group">
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="appearance-none bg-[#0a0a0f] border border-white/5 rounded-2xl pl-12 pr-12 py-5 text-[11px] font-black text-white/50 uppercase tracking-[0.2em] outline-none focus:border-rose-500/30 hover:text-white transition-all cursor-pointer shadow-2xl"
                    >
                        {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-[#050507]">{c.name}</option>)}
                    </select>
                    <Globe size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none group-hover:text-rose-500 transition-colors" />
                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                </div>
            </div>
        </header>

        {/* Unified Genre Nav */}
        <nav className="flex gap-3 overflow-x-auto no-scrollbar mb-16 p-2 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-3xl sticky top-4 z-40">
            <div className="flex items-center px-6 border-r border-white/5 mr-2">
                <Filter size={16} className="text-white/20" />
            </div>
            {genres.map((genre) => (
                <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`shrink-0 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative ${selectedGenre === genre.id
                        ? 'text-white'
                        : 'text-white/30 hover:text-white hover:bg-white/5'
                    }`}
                >
                    {selectedGenre === genre.id && (
                        <motion.div 
                            layoutId="activeMovieGenre"
                            className="absolute inset-0 bg-[#0a0a0f] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                            style={{ borderRadius: 'inherit' }}
                        />
                    )}
                    <span className="relative z-10">{genre.name}</span>
                </button>
            ))}
        </nav>

        {/* Dense Portrait Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
            <AnimatePresence mode="popLayout">
                {movies.map((movie, index) => (
                    <MediaCard
                        key={`${movie.id}-${index}`}
                        item={{ ...movie, media_type: 'movie' }}
                        variant="portrait"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                    />
                ))}
                
                {/* Skeletons while loading more */}
                {loading && [...Array(12)].map((_, i) => (
                    <PortraitMediaCardSkeleton key={`skeleton-${i}`} />
                ))}
            </AnimatePresence>
            
            {/* Safe intersection trigger */}
            {hasMore && <div ref={lastElementRef} className="h-40 col-span-full" />}
        </div>

        {!hasMore && movies.length > 0 && (
            <div className="text-center py-20 border-t border-white/5 mt-20">
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">Protocol End</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default Movies;

