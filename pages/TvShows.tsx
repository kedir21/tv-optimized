
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TvShow, Genre } from '../types';
import MovieCard from '../components/MovieCard';

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
    <main className="min-h-screen bg-slate-950 px-4 pt-20 pb-24 md:px-12 md:pt-12 md:pb-28">
      <Meta
        title={`${selectedGenreName} - Explore Series`}
        description={`Watch the best ${selectedGenreName.toLowerCase()} online. Discover trending series and popular tv shows from around the world.`}
      />
      <header>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">TV Shows</h1>
      </header>

      <section className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar mb-6 md:mb-8 py-2" aria-label="Genre filters">
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`focusable tv-focus whitespace-nowrap px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${selectedGenre === genre.id
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            aria-pressed={selectedGenre === genre.id}
          >
            {genre.name}
          </button>
        ))}
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 animate-in fade-in duration-500" aria-label="TV show list">
        {shows.map((show, index) => {
          if (shows.length === index + 1) {
            return (
              <div ref={lastElementRef} key={`${show.id}-${index}`}>
                <MovieCard
                  movie={{ ...show, media_type: 'tv' }}
                  onClick={() => navigate(`/details/tv/${show.id}`, { state: { movie: show } })}
                  className="w-full h-full"
                />
              </div>
            );
          } else {
            return (
              <MovieCard
                key={`${show.id}-${index}`}
                movie={{ ...show, media_type: 'tv' }}
                onClick={() => navigate(`/details/tv/${show.id}`, { state: { movie: show } })}
                className="w-full h-full"
              />
            );
          }
        })
        }
      </section>

      {loading && (
        <div className="flex justify-center py-10 w-full" aria-live="polite" aria-busy="true">
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </main>
  );
};

export default TvShows;
