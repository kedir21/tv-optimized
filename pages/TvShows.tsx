import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { TvShow, Genre } from '../types';
import MovieCard from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';
import Meta from '../components/Meta';
import { CinematicBackground } from '../components/CinematicBackground';

const TvShows: React.FC = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState<TvShow[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
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
    api.getGenres('tv').then(g => setGenres([{ id: 0, name: 'All' }, ...g]));
  }, []);

  useEffect(() => {
    setShows([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre]);

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      try {
        const newShows = await api.discoverTvShows(page, selectedGenre);
        if (newShows.length === 0) setHasMore(false);
        else setShows(prev => page === 1 ? newShows : [...prev, ...newShows]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchShows();
  }, [page, selectedGenre]);

  return (
    <div className="relative min-h-screen">
      <CinematicBackground />
      <Meta title="TV Shows | K-Flix" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-32">
        <header className="mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2 tracking-tight">TV Shows</h1>
            <p className="text-white/30 font-medium">Stream the best series and dramas</p>
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
                {shows.map((show, index) => (
                    <motion.div
                        key={`${show.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
                        ref={shows.length === index + 1 ? lastElementRef : null}
                    >
                        <MovieCard
                            movie={{ ...show, media_type: 'tv' }}
                            onClick={() => navigate(`/details/tv/${show.id}`)}
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

export default TvShows;
