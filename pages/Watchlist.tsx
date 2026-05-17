import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { ContentItem } from '../types';
import MovieCard from '../components/MovieCard';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { CinematicBackground } from '../components/CinematicBackground';
import Meta from '../components/Meta';

const Watchlist: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchlist = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlist(list as unknown as ContentItem[]);
      setLoading(false);
    };

    loadWatchlist();

    const handleWatchlistUpdate = () => {
      loadWatchlist();
    };

    window.addEventListener('watchlist-updated', handleWatchlistUpdate);
    return () => window.removeEventListener('watchlist-updated', handleWatchlistUpdate);
  }, [user]);

  return (
    <div className="relative min-h-screen">
      <CinematicBackground />
      <Meta title="My Watchlist | K-Flix" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-32">
        <header className="mb-12">
            <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">My List</h1>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-rose-500 uppercase tracking-widest mt-2">
                    {watchlist.length} items
                </span>
            </div>
            <p className="text-white/30 font-medium">Your personal collection and saves</p>
        </header>

        {watchlist.length === 0 && !loading ? (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
              <Heart size={40} className="text-white/10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Your list is empty</h2>
            <p className="text-white/40 max-w-sm mb-10 leading-relaxed">
              Start building your personal library by adding movies and shows you want to watch later.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white text-black rounded-2xl font-bold flex items-center gap-3 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <Plus size={20} />
              Explore Content
            </button>
          </motion.section>
        ) : (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <AnimatePresence>
                {watchlist.map((item, index) => (
                    <motion.div
                        key={`${item.id}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                        <MovieCard
                            movie={item}
                            onClick={() => navigate(`/details/${item.media_type || 'movie'}/${item.id}`)}
                            className="w-full h-full"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
          </section>
        )}

        {loading && (
          <div className="flex justify-center py-20">
             <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-rose-500 animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
