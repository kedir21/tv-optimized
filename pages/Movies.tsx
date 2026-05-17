import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Movie, Genre } from '../types';
import MovieCard from '../components/MovieCard';
import { ChevronDown, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Meta from '../components/Meta';
import { CinematicBackground } from '../components/CinematicBackground';

const COUNTRIES = [
  { code: 'ALL', name: 'Global' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'KR', name: 'K-Drama' },
  { code: 'JP', name: 'Anime' },
  { code: 'IN', name: 'Bollywood' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'DE', name: 'Germany' },
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
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    api.getGenres('movie').then(g => setGenres([{ id: 0, name: 'All' }, ...g]));
  }, []);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre, selectedCountry]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const newMovies = await api.discoverMovies(page, selectedGenre, 'popularity.desc', { country: selectedCountry });
        if (newMovies.length === 0) setHasMore(false);
        else setMovies(prev => page === 1 ? newMovies : [...prev, ...newMovies]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchMovies();
  }, [page, selectedGenre, selectedCountry]);

  return (
    <div className="relative min-h-screen">
      <CinematicBackground />
      <Meta title="Movies | K-Flix" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2 tracking-tight">Movies</h1>
                <p className="text-white/30 font-medium">Explore by genre and region</p>
            </div>

            <div className="relative group self-start md:self-auto">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-rose-500 transition-colors pointer-events-none">
                    <Globe size={16} />
                </div>
                <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-12 pr-10 py-3 text-sm font-bold text-white uppercase tracking-wider outline-none focus:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer"
                >
                    {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-[#0a0a0f]">{c.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto no-scrollbar mb-12 pb-4">
            {genres.map(genre => (
                <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`shrink-0 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedGenre === genre.id
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                    }`}
                >
                    {genre.name}
                </button>
            ))}
        </nav>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <AnimatePresence>
                {movies.map((movie, index) => (
                    <motion.div
                        key={`${movie.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
                        ref={movies.length === index + 1 ? lastElementRef : null}
                    >
                        <MovieCard
                            movie={movie}
                            onClick={() => navigate(`/details/movie/${movie.id}`)}
                            className="w-full h-full"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </section>

        {loading && (
            <div className="flex justify-center py-20 w-full">
                <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-rose-500 animate-spin" />
            </div>
        )}
      </main>
    </div>
  );
};

export default Movies;
