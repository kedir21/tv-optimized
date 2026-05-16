
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon } from 'lucide-react';

import Meta from '../components/Meta';
import { useNavigate } from 'react-router-dom';
const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
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

  // Debounce query change
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset when query changes
      if (query.trim()) {
        setResults([]);
        setPage(1);
        setHasMore(true);
        fetchResults(1, query); // Force fetch page 1
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle page increments for same query
  useEffect(() => {
    if (page > 1 && query.trim()) {
      fetchResults(page, query);
    }
  }, [page]);

  const fetchResults = async (pageNum: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await api.searchMulti(searchQuery, pageNum);
      if (res.length === 0) {
        setHasMore(false);
      } else {
        setResults(prev => pageNum === 1 ? res : [...prev, ...res]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Focus input on load
  useEffect(() => {
    document.getElementById('search-input')?.focus();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] px-4 pt-20 pb-24 md:px-12 md:pt-12 md:pb-28">
      <Meta
        title={query ? `Search results for "${query}"` : 'Search'}
        description="Search for your favorite movies and TV shows on K-Flix. Find trending content and hidden gems."
      />
      
      {/* Animated Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full filter blur-[100px] animate-blob" />
         <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 text-center md:text-left pt-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 tracking-tighter">
            Find Content
          </h1>
        </header>

        {/* Search Bar - Animated */}
        <section className="relative mb-12 max-w-4xl mx-auto md:mx-0 group" aria-label="Search form">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300">
            <SearchIcon className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies & TV shows..."
            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] py-5 pl-16 md:pl-20 pr-6 text-lg md:text-2xl text-white outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-500 hover:bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] focus:shadow-[0_0_30px_rgba(6,182,212,0.3)] placeholder:text-white/30 font-medium"
            autoComplete="off"
            aria-label="Search for content"
          />
        </section>

        {/* Trending Searches (when query empty) */}
        {!query && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <h2 className="text-2xl font-bold mb-6 text-white/50 border-b border-white/10 pb-4">Trending Searches</h2>
             {/* Note: In a complete implementation we would fetch trending keys here, 
                 but we'll show popular suggestions or let the user type. */}
             <div className="flex flex-wrap gap-3">
                 {['Inception', 'Breaking Bad', 'Interstellar', 'The Last of Us', 'Dune', 'Oppenheimer', 'Game of Thrones'].map((term) => (
                    <button 
                       key={term} 
                       onClick={() => setQuery(term)} 
                       className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all font-medium text-white/80 hover:text-white hover:scale-105"
                    >
                       {term}
                    </button>
                 ))}
             </div>
          </div>
        )}

        {/* Results Grid */}
        {query && (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-12 animate-in fade-in duration-700" aria-label="Search results">
            {results.map((item, index) => {
              const uniqueKey = `${item.id}-${item.media_type}-${index}`;
              const isLast = results.length === index + 1;

              if (isLast) {
                return (
                  <div ref={lastElementRef} key={uniqueKey} className="w-full h-full">
                    <MovieCard
                      movie={item}
                      onClick={() => navigate(`/details/${item.media_type || 'movie'}/${item.id}`)}
                      className="w-full !aspect-[2/3]"
                    />
                  </div>
                );
              }
              return (
                <div key={uniqueKey} className="w-full h-full">
                  <MovieCard
                    movie={item}
                    onClick={() => navigate(`/details/${item.media_type || 'movie'}/${item.id}`)}
                    className="w-full !aspect-[2/3]"
                  />
                </div>
              );
            })}
          </section>
        )}

        {loading && (
          <div className="flex justify-center py-20 w-full" aria-live="polite" aria-busy="true">
            <div className="w-12 h-12 border-4 border-white/10 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500" role="status">
            <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
               <SearchIcon className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">No results found</h3>
            <p className="text-white/40 text-lg">We couldn't find anything matching "{query}".</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Search;
