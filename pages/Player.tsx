import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Server } from 'lucide-react';
import { api } from '../services/api';
import { NavigationDirection } from '../types';

const Player: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showControls, setShowControls] = useState(true);
  const [originalLang, setOriginalLang] = useState<string>('en');
  // Parse Query Params
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';

  // Load preferred source from local storage to load faster (better UX)
  const [source, setSource] = useState<'rivestream'>(() => {
    const saved = localStorage.getItem('player_source_pref');
    if (saved && ['rivestream'].includes(saved)) {
      return saved as any;
    }
    return 'rivestream'; // Default source
  });

  const controlsTimeout = useRef<number | null>(null);

  // Check content language to prefer English dubs for foreign content
  useEffect(() => {
    if (!id) return;
    const checkLanguage = async () => {
        try {
            // This hits the cache if user just came from Details page, so it's fast
            const details = await api.getDetails(id, type as 'movie' | 'tv');
            if (details.original_language) {
                setOriginalLang(details.original_language);
            }
        } catch (e) {
            console.warn("Could not determine content language", e);
        }
    };
    checkLanguage();
  }, [id, type]);

  // Auto-hide controls
  useEffect(() => {
    const resetControls = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
      }, 4000);
    };

    resetControls();
    window.addEventListener('mousemove', resetControls);
    window.addEventListener('keydown', resetControls);
    window.addEventListener('touchstart', resetControls);

    return () => {
      window.removeEventListener('mousemove', resetControls);
      window.removeEventListener('keydown', resetControls);
      window.removeEventListener('touchstart', resetControls);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  // Handle Back button to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === NavigationDirection.ESCAPE || e.key === NavigationDirection.BACK) {
            e.preventDefault();
            navigate(`/details/${type}/${id}`);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, type, id]);

  // Focus the back button initially so keyboard user can exit if needed
  useEffect(() => {
      document.getElementById('player-back-btn')?.focus();
  }, []);

  if (!id) return null;

  // Build a better Source Manager
  const SOURCES = [
    {
      name: "RiveStream",
      id: "rivestream",
      movie: (id: string) => `https://rivestream.ru/embed?type=movie&id=${id}`,
      tv: (id: string, season: string, episode: string) => `https://rivestream.ru/embed?type=tv&id=${id}&season=${season}&episode=${episode}`,
      priority: 1,
    }
  ];

  // Construct URL based on selected source and type
  const getEmbedUrl = () => {
    let url = '';
    const currentSource = SOURCES.find(s => s.id === source) || SOURCES[0];
    
    if (type === 'tv') {
        url = currentSource.tv(id, season, episode);
    } else {
        url = currentSource.movie(id);
    }

    // Append English Audio preference for foreign content, but ONLY for sources that support it via ds_lang
    if (currentSource.id !== 'vidsrc-ru' && currentSource.id !== 'vidsrc' && originalLang !== 'en') {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}ds_lang=en&lang=en`;
    }

    return url;
  };

  const handleSourceChange = (newSource: string) => {
      setSource(newSource as any);
      // Persist preference
      localStorage.setItem('player_source_pref', newSource);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [backdrop, setBackdrop] = useState<string>('');

  useEffect(() => {
    // Fetch backdrop for ambient lighting
    const fetchBackdrop = async () => {
      try {
        const details = await api.getDetails(id, type as 'movie' | 'tv');
        if (details.backdrop_path) {
          setBackdrop(details.backdrop_path);
        }
      } catch (e) {
        console.warn("Could not fetch backdrop", e);
      }
    };
    fetchBackdrop();
  }, [id, type]);

  return (
    <div className="fixed inset-0 bg-[#020617] z-50 overflow-hidden group">
      
      {/* Ambient Background Lighting */}
      {backdrop && (
        <div className="absolute inset-x-0 top-0 h-1/2 opacity-30 blur-[100px] pointer-events-none transition-opacity duration-1000 z-0 select-none">
          <img src={`https://image.tmdb.org/t/p/w1280${backdrop}`} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Loading Screen */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-[#020617] z-20 transition-opacity duration-700 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
         <div className="w-16 h-16 border-4 border-white/10 border-t-cyan-500 rounded-full animate-spin mb-6" />
         <h2 className="text-white/80 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Source...</h2>
      </div>
      {/* Iframe Layer with Strict Sandbox for Ad Blocking */}
      {/* Key includes originalLang to force reload if language preference changes */}
      <iframe
        key={`${source}-${id}-${type}-${season}-${episode}-${originalLang}`}
        src={getEmbedUrl()}
        className="w-full h-full border-0 absolute inset-0 z-10"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="origin"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        title="Content Player"
        onLoad={() => setIsLoading(false)}
      />


      {/* Overlay UI - Top Bar floating design */}
      <div 
        className={`fixed inset-x-0 top-0 pointer-events-none transition-opacity duration-700 ease-in-out z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none" />
        
        <div className="relative pt-[calc(1.5rem+env(safe-area-inset-top))] px-6 pb-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 w-full max-w-[1600px] mx-auto pointer-events-auto">
          {/* Left: Back & Info */}
          <div className="flex items-center gap-4">
              <button 
                id="player-back-btn"
                onClick={() => navigate(`/details/${type}/${id}`)}
                className="group flex flex-row items-center justify-center w-12 h-12 md:w-auto md:px-6 md:py-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-white/30 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <ArrowLeft size={20} className="md:w-5 md:h-5 md:mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="hidden md:inline font-bold tracking-wide">Back to Details</span>
              </button>
              
              {type === 'tv' && (
                  <div className="flex items-center px-6 py-3.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white font-black tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                    <span className="text-white/80">S{season}</span> 
                    <span className="mx-3 text-cyan-400">•</span> 
                    <span className="text-white/80">E{episode}</span>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
