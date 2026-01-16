
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { watchlistService } from '../services/watchlist';
import { User, LogOut, Settings, Heart, Shield } from 'lucide-react';
import TvButton from '../components/TvButton';

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

  // Generate initials
  const initials = user.username
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-24 pb-24 md:pl-32 md:pt-16 md:pr-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-12">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-2xl border-4 border-slate-900 ring-2 ring-white/10">
            <span className="text-4xl md:text-5xl font-bold text-white tracking-widest">{initials}</span>
          </div>

          {/* Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-bold text-white">{user.username}</h1>
              <div className="px-2 py-1 bg-white/10 rounded border border-white/10 text-[10px] uppercase font-bold tracking-wider text-gray-300">
                Premium
              </div>
            </div>
            <p className="text-gray-400 text-lg mb-6">{user.email}</p>
            
            <div className="flex gap-4">
              <TvButton 
                variant="primary"
                onClick={() => navigate('/watchlist')}
                className="py-2 px-6 text-sm"
              >
                My List
              </TvButton>
              <TvButton 
                variant="glass"
                onClick={handleLogout}
                className="py-2 px-6 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20"
                icon={<LogOut size={16} />}
              >
                Sign Out
              </TvButton>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mb-4 text-red-500">
              <Heart size={24} />
            </div>
            <span className="text-3xl font-bold text-white mb-1">{watchlistCount}</span>
            <span className="text-sm text-gray-400">Watchlist Items</span>
          </div>
          
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-4 text-blue-500">
              <Shield size={24} />
            </div>
            <span className="text-3xl font-bold text-white mb-1">Active</span>
            <span className="text-sm text-gray-400">Account Status</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-gray-600/20 flex items-center justify-center mb-4 text-gray-400 group-hover:text-white transition-colors">
              <Settings size={24} />
            </div>
            <span className="text-lg font-semibold text-white mb-1">Settings</span>
            <span className="text-sm text-gray-400">Manage Account</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900/20 to-transparent border-l-4 border-red-600 p-6 rounded-r-lg">
           <h3 className="text-xl font-bold text-white mb-2">Member since {new Date(user.joinedAt).getFullYear()}</h3>
           <p className="text-gray-400 max-w-2xl">
             Thank you for being a valued member of KK-flix. Enjoy unlimited streaming of your favorite movies and TV shows without interruption.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
