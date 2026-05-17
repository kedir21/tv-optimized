
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { TvShow, Genre } from '../types';
import MovieCard from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';

import Meta from '../components/Meta';

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
    const fetchGenres = async () => {
      try {
        const g = await api.getGenres('tv');
        setGenres([{ id: 0, name: 'All TV Shows' }, ...g]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchGenres();
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
        if (newShows.length === 0) {
          setHasMore(false);
        } else {
          setShows(prev => [...prev, ...newShows]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [page, selectedGenre]);

  const selectedGenreName = genres.find(g => g.id === selectedGenre)?.name || 'TV Shows';

  return (
    <main className="min-h-screen px-4 pt-16 pb-24 md:px-10 md:pt-10 md:pb-28" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Meta
        title={`${selectedGenreName} - Explore Series`}
        description={`Watch the best ${selectedGenreName.toLowerCase()} online.`}
      />
      <header>
        <h1 className="text-2xl md:text-3xl font-bold mb-5 text-white tracking-tight">TV Shows</h1>
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

      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 animate-fade-in" aria-label="TV show list">
        {shows.map((show, index) => {
          if (shows.length === index + 1) {
            return (
              <div ref={lastElementRef} key={`${show.id}-${index}`}>
                <MovieCard
                  movie={{ ...show, media_type: 'tv' }}
                  onClick={() => navigate(`/details/tv/${show.id}`)}
                  className="w-full h-full"
                />
              </div>
            );
          } else {
            return (
              <MovieCard
                key={`${show.id}-${index}`}
                movie={{ ...show, media_type: 'tv' }}
                onClick={() => navigate(`/details/tv/${show.id}`)}
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

export default TvShows;
