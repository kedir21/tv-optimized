
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
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 animate-spin"></div>
      </div>
      <p className="text-white/30 text-sm font-medium tracking-widest uppercase">Loading</p>
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
    <div className="min-h-screen w-screen overflow-x-hidden font-sans antialiased" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
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
