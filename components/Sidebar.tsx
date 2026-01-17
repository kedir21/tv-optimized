
import React from 'react';
import { Home, Search, Film, Tv, Heart, User as UserIcon, LogIn, Radio } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: <Home size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Home", path: "/" },
    { icon: <Search size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Search", path: "/search" },
    { icon: <Film size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Movies", path: "/movies" },
    { icon: <Tv size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "TV", path: "/tv" },
    { icon: <Radio size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Networks", path: "/networks" },
    { icon: <Heart size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "My List", path: "/watchlist" },
  ];

  // Add Profile or Login based on auth state
  const profileItem = user 
    ? { icon: <UserIcon size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Profile", path: "/profile" }
    : { icon: <LogIn size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Sign In", path: "/auth" };

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 md:h-20 z-50 bg-black/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl pb-safe-area-inset-bottom flex items-center justify-center gap-1 md:gap-8 px-2">
      
      {/* Container for centering max width if needed, or just flex the items */}
      <div className="flex w-full max-w-7xl items-center justify-around md:justify-center md:gap-12">
        {navItems.map((item) => (
            <button
            key={item.label}
            onClick={() => handleNav(item.path)}
            className={`focusable tv-focus p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 min-w-[3.5rem] md:min-w-[4.5rem] ${
                location.pathname === item.path 
                ? 'text-white' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
            aria-label={item.label}
            >
            {item.icon}
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
        ))}

        <button
            onClick={() => handleNav(profileItem.path)}
            className={`focusable tv-focus p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 min-w-[3.5rem] md:min-w-[4.5rem] group ${
                location.pathname === profileItem.path 
                ? 'text-red-500' 
                : 'text-red-500/70 hover:text-red-500 hover:bg-red-900/10'
            }`}
            aria-label={profileItem.label}
            >
            <div className="relative">
                {profileItem.icon}
            </div>
            <span className="text-[10px] font-bold tracking-wide uppercase">{profileItem.label}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
