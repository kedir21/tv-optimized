import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { ContentItem } from '../types';
import MediaCard from '../components/MediaCard';
import { Search as SearchIcon, X, Terminal, Cpu } from 'lucide-react';
import Meta from '../components/Meta';
import { useNavigate } from 'react-router-dom';
import { CinematicBackground } from '../components/CinematicBackground';

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

  return (
    <div className="relative min-h-screen">
      <CinematicBackground />
      
      <Meta
        title={query ? `Search: ${query}` : 'Explore'}
        description="Search for your favorite movies and TV shows on K-Flix."
      />

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-32">
        <header className="mb-16">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                <h1 className="text-4xl md:text-7xl font-display font-black text-white uppercase tracking-tighter leading-none">Neural Search</h1>
            </div>
          <div className="relative group max-w-3xl">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-rose-500 transition-colors">
              <Terminal size={24} />
            </div>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query matrix for titles, personnel..."
              className="w-full bg-white/5 border border-white/10 rounded-[32px] py-8 pl-18 pr-16 text-xl md:text-2xl font-bold text-white outline-none focus:border-rose-500/50 hover:bg-white/10 transition-all placeholder:text-white/10 shadow-2xl"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-white/20 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          <AnimatePresence mode="popLayout">
            {results.map((item, index) => (
                <MediaCard
                  key={`${item.id}-${index}`}
                  item={item}
                  variant="portrait"
                  onClick={() => navigate(`/details/${item.media_type || 'movie'}/${item.id}`)}
                  ref={results.length === index + 1 ? lastElementRef : null}
                />
            ))}
          </AnimatePresence>
        </section>

        {!query && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12"
          >
             <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-6">Trending Searches</h2>
             <div className="flex flex-wrap gap-3">
                 {['Inception', 'Succession', 'Interstellar', 'The Last of Us', 'Dune', 'Spider-Man', 'The Bear'].map((term) => (
                    <button 
                       key={term} 
                       onClick={() => setQuery(term)} 
                       className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 hover:border-rose-500/30 transition-all"
                    >
                       {term}
                    </button>
                 ))}
             </div>
          </motion.div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-rose-500 animate-spin" />
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <SearchIcon size={40} className="text-white/10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
            <p className="text-white/40">Try searching for something else</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
