import React from 'react';
import { Home, Search, Film, Tv, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Home", path: "/" },
    { icon: <Search size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Search", path: "/search" },
    { icon: <Film size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "Movies", path: "/movies" },
    { icon: <Tv size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "TV", path: "/tv" },
    { icon: <Heart size={24} className="md:w-6 md:h-6 w-5 h-5" />, label: "My List", path: "/watchlist" },
  ];

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 md:left-0 md:top-0 md:h-full md:w-20 z-50 bg-black/90 md:bg-black/90 backdrop-blur-xl md:backdrop-blur-md flex flex-row md:flex-col items-center justify-around md:justify-start md:py-10 md:gap-8 border-t md:border-t-0 md:border-r border-white/10 shadow-2xl md:shadow-none pb-safe-area-inset-bottom">
      <div className="hidden md:block mb-8 text-red-600">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 10C2 6.68629 4.68629 4 8 4H16C19.3137 4 22 6.68629 22 10V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V10Z" />
          <path d="M7 4V2H17V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => handleNav(item.path)}
          className={`focusable tv-focus p-2 md:p-3 rounded-full md:rounded-full flex flex-col items-center gap-1 transition-colors ${
            location.pathname === item.path 
              ? 'text-white md:bg-white md:text-black' 
              : 'text-gray-500 hover:text-white'
          }`}
          aria-label={item.label}
        >
          {item.icon}
          <span className="text-[10px] font-medium md:hidden">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;