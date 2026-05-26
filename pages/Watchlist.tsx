import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { ContentItem } from '../types';
import MediaCard from '../components/MediaCard';
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

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-32">
        <header className="mb-12">
            <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-none uppercase">My Deck</h1>
                <div className="px-5 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-black text-rose-500 uppercase tracking-widest mt-2">
                    {watchlist.length} verified
                </div>
            </div>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">Neural Watchlist Protocol</p>
        </header>

        {watchlist.length === 0 && !loading ? (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-32 h-32 rounded-[40px] bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
              <Heart size={48} className="text-white/10" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Deck is Empty</h2>
            <p className="text-white/30 max-w-sm mb-12 leading-relaxed font-medium">
              Start building your personal library by adding movies and shows you want to watch later.
            </p>
            <button
              onClick={() => navigate('/')}
              className="h-14 px-10 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <Plus size={20} />
              Begin Uplink
            </button>
          </motion.section>
        ) : (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            <AnimatePresence mode="popLayout">
                {watchlist.map((item, index) => (
                    <MediaCard
                        key={`${item.id}-${index}`}
                        item={item}
                        variant="portrait"
                        onClick={() => navigate(`/details/${item.media_type || 'movie'}/${item.id}`)}
                    />
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
