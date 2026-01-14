
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Movie, Genre } from '../types';
import MovieCard from '../components/MovieCard';
import { MovieCardSkeleton } from '../components/Skeletons';
import { ChevronDown, Globe } from 'lucide-react';

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

  // Initial Genre Fetch
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

  // Reset when filters change
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre, selectedCountry]);

  // Fetch Movies
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        // Pass country in options
        const newMovies = await api.discoverMovies(page, selectedGenre, 'popularity.desc', { country: selectedCountry });
        if (newMovies.length === 0) {
          setHasMore(false);
        } else {
          setMovies(prev => {
             // Basic de-duplication
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

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-20 pb-24 md:pl-24 md:pt-8 md:pr-8 md:pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Movies</h1>
        
        {/* Country Filter */}
        <div className="relative group min-w-[160px] max-w-[200px]">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors pointer-events-none">
               <Globe size={16} />
           </div>
           <select 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="appearance-none w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all cursor-pointer focusable tv-focus font-medium"
           >
               {COUNTRIES.map(c => (
                   <option key={c.code} value={c.code} className="bg-slate-900 text-white">{c.name}</option>
               ))}
           </select>
           <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
      
      {/* Genre Filter */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar mb-6 md:mb-8 py-2">
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`focusable tv-focus whitespace-nowrap px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
              selectedGenre === genre.id 
                ? 'bg-red-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
        {movies.length === 0 && loading ? (
           // Initial Loading Skeletons
           [...Array(12)].map((_, i) => <MovieCardSkeleton key={i} className="w-full h-full" />)
        ) : (
          movies.map((movie, index) => {
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
        )}
      </div>

      {/* Pagination Loading */}
      {loading && movies.length > 0 && (
        <div className="flex justify-center py-10 w-full">
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default Movies;
