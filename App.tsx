
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BackButton from './components/BackButton';
import AdblockWarning from './components/AdblockWarning';
import { handleSpatialNavigation } from './utils/spatialNavigation';
import { AuthProvider } from './context/AuthContext';

// Lazy Load Pages for Faster Initial Render
const Home = lazy(() => import('./pages/Home'));
const Details = lazy(() => import('./pages/Details'));
const Player = lazy(() => import('./pages/Player'));
const Search = lazy(() => import('./pages/Search'));
const Movies = lazy(() => import('./pages/Movies'));
const TvShows = lazy(() => import('./pages/TvShows'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const NetworkDetails = lazy(() => import('./pages/NetworkDetails'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));

// Premium Loading Fallback
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#040406] flex items-center justify-center p-6 text-center">
    <div className="relative">
      <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-8 mx-auto relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-50" />
         <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
      </div>
      <div className="space-y-2">
        <h2 className="text-white font-display font-bold text-2xl tracking-tight">K-Flix</h2>
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Initializing Studio</p>
      </div>
    </div>
  </div>
);

// Component to handle global keydown events for navigation
const TvNavigationController: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleSpatialNavigation(e, 'focusable');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname]);

  return null;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPlayer = location.pathname.startsWith('/watch/');
  const isAuth = location.pathname.startsWith('/auth');

  return (
    <div className="min-h-screen w-full relative bg-[#040406] text-[#f8fafc] font-sans antialiased overflow-x-hidden">
      <TvNavigationController />
      {!isPlayer && !isAuth && <Sidebar />}
      {!isAuth && <BackButton />}
      <div className="relative z-0">
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
        <AdblockWarning />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TvShows />} />
            <Route path="/network/:id" element={<NetworkDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/movie/:id" element={<Details />} />
            <Route path="/details/:type/:id" element={<Details />} />
            <Route path="/watch/:id" element={<Player />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
