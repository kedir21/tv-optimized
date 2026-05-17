import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { watchlistService } from '../services/watchlist';
import { User, LogOut, Settings, Heart, Shield, Sparkles } from 'lucide-react';
import { CinematicBackground } from '../components/CinematicBackground';
import Meta from '../components/Meta';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    const fetchWatchlistCount = async () => {
      const list = await watchlistService.getWatchlist();
      setWatchlistCount(list.length);
    };
    fetchWatchlistCount();
  }, [user]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="relative min-h-screen">
      <CinematicBackground />
      <Meta title={`${user.username} | K-Flix`} />

      <main className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-32">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl shadow-2xl"
        >
            <div className="bg-gradient-to-br from-rose-500/20 via-transparent to-rose-500/10 p-10 md:p-16">
                 <header className="flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-rose-500 to-rose-800 flex items-center justify-center border-8 border-white/5 shadow-2xl ring-1 ring-white/10 shrink-0">
                        <span className="text-4xl md:text-5xl font-display font-bold text-white tracking-widest">{initials}</span>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                             <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">{user.username}</h1>
                             <span className="px-3 py-1 rounded-full bg-rose-500 text-[10px] font-bold uppercase tracking-widest text-white mt-1">Premium</span>
                        </div>
                        <p className="text-xl text-white/40 mb-8 font-medium">{user.email}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <button
                                onClick={() => navigate('/watchlist')}
                                className="px-8 py-3 bg-white text-black rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                            >
                                <Heart size={18} />
                                My List
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                 </header>
            </div>

            <div className="p-10 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 text-rose-500">
                      <Heart size={28} />
                    </div>
                    <span className="text-4xl font-display font-bold text-white mb-2">{watchlistCount}</span>
                    <span className="text-sm font-bold text-white/30 uppercase tracking-[0.2em]">Watchlist</span>
                 </div>

                 <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                      <Shield size={28} />
                    </div>
                    <span className="text-4xl font-display font-bold text-white mb-2">Verified</span>
                    <span className="text-sm font-bold text-white/30 uppercase tracking-[0.2em]">Account Status</span>
                 </div>

                 <button className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white/20 group-hover:text-rose-500 transition-colors">
                      <Settings size={28} />
                    </div>
                    <span className="text-2xl font-display font-bold text-white mb-2">Settings</span>
                    <span className="text-sm font-bold text-white/30 uppercase tracking-[0.2em]">Configuration</span>
                 </button>
            </div>

            <div className="px-10 md:px-16 pb-16">
                 <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-500/5 to-transparent border-l-4 border-rose-500">
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles size={20} className="text-rose-500" />
                        <h3 className="text-2xl font-bold text-white">Member since {new Date(user.joinedAt).getFullYear()}</h3>
                    </div>
                    <p className="text-white/40 text-lg leading-relaxed max-w-2xl">
                        Thank you for being a part of K-Flix. We are committed to providing you with the best cinematic experience possible.
                    </p>
                 </div>
            </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
