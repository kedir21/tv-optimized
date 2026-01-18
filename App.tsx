
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BackButton from './components/BackButton';
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
const Networks = lazy(() => import('./pages/Networks'));
const NetworkDetails = lazy(() => import('./pages/NetworkDetails'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading Fallback
const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Component to handle global keydown events for navigation
const TvNavigationController: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pass the event to our spatial navigation utility
      handleSpatialNavigation(e, 'focusable');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname]); // Re-bind on route change if necessary

  return null;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Strictly check for /watch/ to avoid hiding sidebar on /watchlist
  const isPlayer = location.pathname.startsWith('/watch/');
  const isAuth = location.pathname.startsWith('/auth');

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white overflow-x-hidden font-sans antialiased selection:bg-red-500 selection:text-white">
      <TvNavigationController />
      {!isPlayer && !isAuth && <Sidebar />}
      {!isAuth && <BackButton />}
      <div className="relative z-0">
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
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
            <Route path="/networks" element={<Networks />} />
            <Route path="/network/:id" element={<NetworkDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
            {/* Support legacy /movie/:id route if needed, or redirect */}
            <Route path="/movie/:id" element={<Details />} /> 
            {/* New Unified Details Route */}
            <Route path="/details/:type/:id" element={<Details />} />
            
            <Route path="/watch/:id" element={<Player />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
