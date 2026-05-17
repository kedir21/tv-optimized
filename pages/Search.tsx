
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setResults([]);
        setPage(1);
        setHasMore(true);
        fetchResults(1, query);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

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

  useEffect(() => {
    document.getElementById('search-input')?.focus();
  }, []);

  return (
    <main className="min-h-screen px-4 pt-16 pb-24 md:px-10 md:pt-10 md:pb-28" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Meta
        title={query ? `Search results for "${query}"` : 'Search'}
        description="Search for your favorite movies and TV shows on K-Flix."
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-10 text-center md:text-left pt-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-1 text-white tracking-tight">
            Search
          </h1>
          <p className="text-white/30 text-sm">Find movies & TV shows</p>
        </header>

        {/* Search Bar */}
        <section className="relative mb-10 max-w-3xl mx-auto md:mx-0 group" aria-label="Search form">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-white/50 transition-colors duration-200">
            <SearchIcon className="w-5 h-5" />
          </div>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies & TV shows..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-4 pl-14 pr-5 text-base text-white outline-none focus:ring-1 focus:ring-rose-500/30 focus:border-rose-500/30 transition-all duration-300 hover:bg-white/[0.06] placeholder:text-white/20 font-medium"
            autoComplete="off"
            aria-label="Search for content"
          />
        </section>

        {/* Trending Searches */}
        {!query && !loading && (
          <div className="animate-fade-in">
             <h2 className="text-sm font-medium mb-4 text-white/30 uppercase tracking-wider">Trending Searches</h2>
             <div className="flex flex-wrap gap-2">
                 {['Inception', 'Breaking Bad', 'Interstellar', 'The Last of Us', 'Dune', 'Oppenheimer', 'Game of Thrones'].map((term) => (
                    <button 
                       key={term} 
                       onClick={() => setQuery(term)} 
                       className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.08] transition-all text-sm text-white/60 hover:text-white/80"
                    >
                       {term}
                    </button>
                 ))}
             </div>
          </div>
        )}

        {/* Results Grid */}
        {query && (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8 animate-fade-in" aria-label="Search results">
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
          <div className="flex justify-center py-16 w-full" aria-live="polite" aria-busy="true">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 animate-spin"></div>
            </div>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in" role="status">
            <div className="w-20 h-20 mb-5 rounded-full bg-white/[0.04] flex items-center justify-center">
               <SearchIcon className="w-10 h-10 text-white/15" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5">No results found</h3>
            <p className="text-white/30 text-sm">We couldn't find anything matching "{query}".</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Search;
