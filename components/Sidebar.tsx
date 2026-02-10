
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
    { icon: <Radio size={24} />, label: "Networks", path: "/networks" },
    { icon: <Heart size={24} />, label: "My List", path: "/watchlist" },
  ];

  const profileItem = user
    ? { icon: <UserIcon size={24} />, label: "Profile", path: "/profile" }
    : { icon: <LogIn size={24} />, label: "Sign In", path: "/auth" };

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-900/70 backdrop-blur-2xl rounded-full shadow-lg border border-white/10 overflow-hidden">
        <ul className="flex items-center justify-center gap-2 p-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`relative focusable tv-focus p-3 rounded-full flex items-center justify-center transition-all duration-300 ${location.pathname === item.path
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                aria-label={item.label}
                title={item.label}
              >
                {item.icon}
              </Link>
            </li>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2" aria-hidden="true"></div>
          <li>
            <Link
              to={profileItem.path}
              className={`relative focusable tv-focus p-3 rounded-full flex items-center justify-center transition-all duration-300 group ${location.pathname === profileItem.path
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              aria-label={profileItem.label}
              title={profileItem.label}
            >
              {profileItem.icon}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
