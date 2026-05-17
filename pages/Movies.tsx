
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { Movie, Genre } from '../types';
import MovieCard from '../components/MovieCard';
import { ChevronDown, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COUNTRIES = [
  { code: 'ALL', name: 'Global' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'DE', name: 'Germany' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }
];

import Meta from '../components/Meta';

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
    const fetchGenres = async () => {
      try {
        const g = await api.getGenres('movie');
        setGenres([{ id: 0, name: 'All Movies' }, ...g]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchGenres();
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
        if (newMovies.length === 0) {
          setHasMore(false);
        } else {
          setMovies(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNew = newMovies.filter(m => !existingIds.has(m.id));
            return [...prev, ...uniqueNew];
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, selectedGenre, selectedCountry]);

  const selectedGenreName = genres.find(g => g.id === selectedGenre)?.name || 'Movies';

  return (
    <main className="min-h-screen px-4 pt-16 pb-24 md:px-10 md:pt-10 md:pb-28" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Meta
        title={`${selectedGenreName} - Explore Movies`}
        description={`Browse our extensive collection of ${selectedGenreName.toLowerCase()}.`}
      />
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Movies</h1>

        <div className="relative group min-w-[140px] max-w-[180px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 group-hover:text-white/50 transition-colors pointer-events-none">
            <Globe size={14} />
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="appearance-none w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] text-white text-xs rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500/30 transition-all cursor-pointer font-medium"
            aria-label="Filter by country"
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code} className="bg-[var(--bg-card)] text-white">{c.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        </div>
      </header>

      <section className="flex gap-1.5 md:gap-2 overflow-x-auto no-scrollbar mb-6 py-1.5" aria-label="Genre filters">
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`focusable tv-focus whitespace-nowrap px-3.5 py-1.5 md:px-5 md:py-2 rounded-lg text-xs font-medium transition-all ${selectedGenre === genre.id
                ? 'bg-rose-500 text-white'
                : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70'
              }`}
            aria-pressed={selectedGenre === genre.id}
          >
            {genre.name}
          </button>
        ))}
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 animate-fade-in" aria-label="Movie list">
        {movies.map((movie, index) => {
          if (movies.length === index + 1) {
            return (
              <div ref={lastElementRef} key={`${movie.id}-${index}`}>
                <MovieCard
                  movie={movie}
                  onClick={() => navigate(`/details/movie/${movie.id}`)}
                  className="w-full h-full"
                />
              </div>
            );
          } else {
            return (
              <MovieCard
                key={`${movie.id}-${index}`}
                movie={movie}
                onClick={() => navigate(`/details/movie/${movie.id}`)}
                className="w-full h-full"
              />
            );
          }
        })
        }
      </section>

      {loading && (
        <div className="flex justify-center py-10 w-full" aria-live="polite" aria-busy="true">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 animate-spin"></div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Movies;
