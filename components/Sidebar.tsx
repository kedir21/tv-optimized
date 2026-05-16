
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

  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true);  // scrolling up
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0 pointer-events-none'} w-[92%] sm:w-auto max-w-[28rem]`}>
      <div className="bg-gray-900/80 sm:bg-gray-900/60 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.2)] border border-white/10 overflow-hidden p-1.5 ring-1 ring-white/5 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(6,182,212,0.4)] sm:hover:bg-gray-900/80 flex justify-between sm:justify-center items-center">
        <ul className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 w-full px-2 sm:px-0">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`relative focusable tv-focus p-3 md:p-4 rounded-full flex items-center justify-center transition-all duration-500 group overflow-hidden ${location.pathname === item.path
                    ? 'bg-gradient-to-tr from-cyan-600 to-cyan-400 text-[#020617] shadow-[0_0_20px_rgba(6,182,212,0.6)] font-bold scale-110'
                    : 'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-[1.15] active:scale-95'
                  }`}
                aria-label={item.label}
                title={item.label}
              >
                {/* Active Glow pulse effect */}
                {location.pathname === item.path && (
                  <div className="absolute inset-0 bg-white/30 animate-pulse-slow mix-blend-overlay" />
                )}
                <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
              </Link>
            </li>
          ))}
          <div className="w-px h-8 bg-white/10 mx-1 md:mx-3" aria-hidden="true"></div>
          <li>
            <Link
              to={profileItem.path}
              className={`relative focusable tv-focus p-3 md:p-4 rounded-full flex items-center justify-center transition-all duration-500 group overflow-hidden ${location.pathname === profileItem.path
                  ? 'bg-gradient-to-tr from-cyan-600 to-cyan-400 text-[#020617] shadow-[0_0_20px_rgba(6,182,212,0.6)] font-bold scale-110'
                  : 'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-[1.15] active:scale-95'
                }`}
              aria-label={profileItem.label}
              title={profileItem.label}
            >
              {location.pathname === profileItem.path && (
                  <div className="absolute inset-0 bg-white/30 animate-pulse-slow mix-blend-overlay" />
                )}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                {profileItem.icon}
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
