
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
    ? { icon: <UserIcon size={24} className="md:w-6 md:h-6 w-5 h-5 text-red-500" />, label: "Profile", path: "/profile" }
    : { icon: <LogIn size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Sign In", path: "/auth" };

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 md:left-0 md:top-0 md:h-full md:w-24 z-50 bg-black/90 md:bg-black/90 backdrop-blur-xl md:backdrop-blur-md flex flex-row md:flex-col items-center justify-around md:justify-start md:py-10 md:gap-6 border-t md:border-t-0 md:border-r border-white/10 shadow-2xl md:shadow-none pb-safe-area-inset-bottom">
      <div 
        className="hidden md:flex flex-col items-center mb-6 text-red-600 select-none cursor-pointer"
        onClick={() => navigate('/')}
      >
        <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill="currentColor"/>
          <path d="M20 20 V80" stroke="black" strokeWidth="12" strokeLinecap="round"/>
          <path d="M20 50 L55 20" stroke="black" strokeWidth="12" strokeLinecap="round"/>
          <path d="M20 50 L55 80" stroke="black" strokeWidth="12" strokeLinecap="round"/>
          <path d="M60 20 V80" stroke="white" strokeWidth="12" strokeLinecap="round"/>
          <path d="M60 50 L90 20" stroke="white" strokeWidth="12" strokeLinecap="round"/>
          <path d="M60 50 L90 80" stroke="white" strokeWidth="12" strokeLinecap="round"/>
        </svg>
        <span className="text-[10px] font-bold tracking-widest text-white mt-1">KKFLIX</span>
      </div>
      
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => handleNav(item.path)}
          className={`focusable tv-focus p-2 md:py-3 md:px-2 rounded-xl md:rounded-xl flex flex-col items-center gap-1.5 transition-colors w-full ${
            location.pathname === item.path 
              ? 'text-white md:bg-white/10 md:text-white' 
              : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
          aria-label={item.label}
        >
          {item.icon}
          <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
        </button>
      ))}

      <div className="md:mt-auto w-full flex justify-center">
        <button
            onClick={() => handleNav(profileItem.path)}
            className={`focusable tv-focus p-2 md:py-3 md:px-2 rounded-xl md:rounded-xl flex flex-col items-center gap-1.5 transition-colors w-full ${
              location.pathname === profileItem.path 
                ? 'text-white md:bg-white/10 md:text-white' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
            aria-label={profileItem.label}
          >
            {profileItem.icon}
            <span className="text-[10px] font-medium tracking-wide">{profileItem.label}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
