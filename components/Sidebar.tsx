import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Film, Tv, Heart, User as UserIcon, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: <Home size={18} />, label: "Home", path: "/" },
    { icon: <Search size={18} />, label: "Search", path: "/search" },
    { icon: <Film size={18} />, label: "Movies", path: "/movies" },
    { icon: <Tv size={18} />, label: "TV", path: "/tv" },
    { icon: <Heart size={18} />, label: "My List", path: "/watchlist" },
  ];

  const profilePath = user ? "/profile" : "/auth";
  const profileIcon = user ? <UserIcon size={18} /> : <LogIn size={18} />;
  const profileLabel = user ? "Profile" : "Sign In";

  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] sm:w-auto flex justify-center"
    >
      <div className="glass rounded-[24px] px-2 py-1.5 flex items-center gap-1 shadow-2xl ring-1 ring-white/5">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`relative px-4 py-2.5 rounded-[18px] flex flex-col items-center gap-1 transition-all duration-300 group ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-white/10 rounded-[18px]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                {isActive && (
                    <motion.div 
                        layoutId="nav-dot"
                        className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_8px_#e11d48]"
                    />
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="w-px h-6 bg-white/10 mx-2" aria-hidden="true" />
        
        <Link
          to={profilePath}
          className={`relative px-4 py-2.5 rounded-[18px] flex items-center justify-center transition-all duration-300 group ${
            location.pathname === profilePath ? 'text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          {location.pathname === profilePath && (
            <motion.div
              layoutId="nav-bg"
              className="absolute inset-0 bg-white/10 rounded-[18px]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
            {profileIcon}
          </div>
        </Link>
      </div>
    </motion.nav>
  );
};

export default Sidebar;
