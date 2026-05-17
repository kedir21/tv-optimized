
import React from 'react';
import { Home, Search, Film, Tv, Heart, User as UserIcon, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: <Home size={20} />, label: "Home", path: "/" },
    { icon: <Search size={20} />, label: "Search", path: "/search" },
    { icon: <Film size={20} />, label: "Movies", path: "/movies" },
    { icon: <Tv size={20} />, label: "TV", path: "/tv" },
    { icon: <Heart size={20} />, label: "My List", path: "/watchlist" },
  ];

  const profileItem = user
    ? { icon: <UserIcon size={20} />, label: "Profile", path: "/profile" }
    : { icon: <LogIn size={20} />, label: "Sign In", path: "/auth" };

  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0 pointer-events-none'
      } w-[calc(100%-2rem)] sm:w-auto max-w-md`}
    >
      <div className="glass-strong rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden px-1.5 py-1.5 flex justify-between sm:justify-center items-center">
        <ul className="flex items-center justify-between sm:justify-center gap-0.5 sm:gap-1 w-full px-1 sm:px-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`relative focusable tv-focus p-3 sm:p-3.5 rounded-xl flex items-center justify-center transition-all duration-300 group overflow-hidden ${
                    isActive
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/80 active:scale-90'
                  }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white/10" />
                  )}
                  {/* Active dot indicator */}
                  {isActive && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_6px_var(--accent-glow)]" />
                  )}
                  <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </div>
                </Link>
              </li>
            );
          })}
          
          <div className="w-px h-6 bg-white/8 mx-1 sm:mx-2" aria-hidden="true"></div>
          
          <li>
            <Link
              to={profileItem.path}
              className={`relative focusable tv-focus p-3 sm:p-3.5 rounded-xl flex items-center justify-center transition-all duration-300 group overflow-hidden ${
                location.pathname === profileItem.path
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/80 active:scale-90'
              }`}
              aria-label={profileItem.label}
              title={profileItem.label}
            >
              {location.pathname === profileItem.path && (
                <div className="absolute inset-0 rounded-xl bg-white/10" />
              )}
              {location.pathname === profileItem.path && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_6px_var(--accent-glow)]" />
              )}
              <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
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
