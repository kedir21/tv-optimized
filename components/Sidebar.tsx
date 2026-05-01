
import React from 'react';
import { Home, Search, Film, Tv, Heart, User as UserIcon, LogIn, Radio } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: <Home size={24} />, label: "Home", path: "/" },
    { icon: <Search size={24} />, label: "Search", path: "/search" },
    { icon: <Film size={24} />, label: "Movies", path: "/movies" },
    { icon: <Tv size={24} />, label: "TV", path: "/tv" },
    { icon: <Heart size={24} />, label: "My List", path: "/watchlist" },
  ];

  const profileItem = user
    ? { icon: <UserIcon size={24} />, label: "Profile", path: "/profile" }
    : { icon: <LogIn size={24} />, label: "Sign In", path: "/auth" };

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-900/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden p-1.5">
        <ul className="flex items-center justify-center gap-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`relative focusable tv-focus p-4 rounded-full flex items-center justify-center transition-all duration-500 group ${location.pathname === item.path
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 hover:scale-110 active:scale-95'
                  }`}
                aria-label={item.label}
                title={item.label}
              >
                <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                {location.pathname === item.path && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full transition-all duration-500" />
                )}
              </Link>
            </li>
          ))}
          <div className="w-px h-8 bg-white/5 mx-3" aria-hidden="true"></div>
          <li>
            <Link
              to={profileItem.path}
              className={`relative focusable tv-focus p-4 rounded-full flex items-center justify-center transition-all duration-500 group ${location.pathname === profileItem.path
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 hover:scale-110 active:scale-95'
                }`}
              aria-label={profileItem.label}
              title={profileItem.label}
            >
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                {profileItem.icon}
              </div>
              {location.pathname === profileItem.path && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full transition-all duration-500" />
              )}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
