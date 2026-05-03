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
  const [source, setSource] = useState<'rivestream' | 'cinemaos' | 'vidfast'>(() => {
    const saved = localStorage.getItem('player_source_pref');
    if (saved && ['rivestream', 'cinemaos', 'vidfast'].includes(saved)) {
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

  // Construct URL based on selected source and type
  const getEmbedUrl = () => {
    let url = '';
    
    // Base URL Selection
    if (source === 'cinemaos') {
        if (type === 'tv') {
            url = `https://cinemaos.tech/player/${id}/${season}/${episode}`;
        } else {
            url = `https://cinemaos.tech/player/${id}`;
        }
    } else if (source === 'rivestream') {
      if (type === 'tv') {
        url = `https://rivestream.org/embed?type=tv&id=${id}&season=${season}&episode=${episode}&autoplay=1`;
      } else {
        url = `https://rivestream.org/embed?type=movie&id=${id}&autoplay=1`;
      }
    } else if (source === 'vidfast') {
      if (type === 'tv') {
        url = `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=true`;
      } else {
        url = `https://vidfast.pro/movie/${id}?autoPlay=true`;
      }
    } else {
      // rivestream fallback logic (now default)
      if (type === 'tv') {
        url = `https://rivestream.org/embed?type=tv&id=${id}&season=${season}&episode=${episode}&autoplay=1`;
      } else {
        url = `https://rivestream.org/embed?type=movie&id=${id}&autoplay=1`;
      }
    }

    // Append English Audio preference for foreign content
    if (originalLang !== 'en') {
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

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden group">
      {/* Iframe Layer with Strict Sandbox for Ad Blocking */}
      {/* Key includes originalLang to force reload if language preference changes */}
      <iframe
        key={`${source}-${id}-${type}-${season}-${episode}-${originalLang}`}
        src={getEmbedUrl()}
        className="w-full h-full border-0 absolute inset-0 z-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="origin"
        // VidFast needs less restrictive iframe sandboxing; others match VidSrc-style sandbox.
        sandbox={source === 'vidfast' ? undefined : 'allow-scripts allow-same-origin allow-forms allow-presentation'}
        title="Content Player"
      />

      {/* Overlay UI - Top Bar floating design */}
      <div 
        className={`fixed inset-x-0 top-0 pointer-events-none transition-opacity duration-700 ease-in-out z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none" />
        
        <div className="relative pt-[calc(1.5rem+env(safe-area-inset-top))] px-6 pb-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full max-w-[1600px] mx-auto pointer-events-auto">
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

          {/* Right: Source Selector */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 px-4 text-white/70 bg-white/5 rounded-full py-2 border border-white/5 shadow-inner">
                  <Server size={16} className="text-cyan-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Source</span>
              </div>
              <div className="relative">
                  <select
                      value={source}
                      onChange={(e) => handleSourceChange(e.target.value)}
                      className="appearance-none bg-transparent hover:bg-white/10 text-white text-sm font-bold py-2.5 pl-5 pr-12 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors border border-transparent shadow-inner"
                  >
                      <option value="rivestream" className="bg-slate-900 text-white font-medium">RiveStream</option>
                      <option value="cinemaos" className="bg-slate-900 text-white font-medium">CinemaOS</option>
                      <option value="vidfast" className="bg-slate-900 text-white font-medium">VidFast</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-cyan-400 transition-transform group-hover:translate-y-0.5">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
