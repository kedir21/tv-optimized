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
  const [source, setSource] = useState<'vidsrc' | 'rivestream' | 'cinemaos'>(() => {
    const saved = localStorage.getItem('player_source_pref');
    if (saved && ['vidsrc', 'rivestream', 'cinemaos'].includes(saved)) {
      return saved as any;
    }
    return 'vidsrc'; // Changed default from 'cinemaos' to 'vidsrc'
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
    } else {
      // Vidsrc fallback logic (now default)
      if (type === 'tv') {
        url = `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=true`;
      } else {
        url = `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`;
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="origin"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        title="Content Player"
      />

      {/* Overlay UI - Controls stacked on left side */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 bg-gradient-to-b from-black/90 via-transparent to-transparent h-48 md:h-56 z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="p-4 md:p-8 flex flex-col items-start gap-4 w-full max-w-7xl mx-auto">
          {/* Row 1: Back Button & Season Info */}
          <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
              <button 
                id="player-back-btn"
                onClick={() => navigate(`/details/${type}/${id}`)}
                className="focusable tv-focus flex items-center gap-2 md:gap-3 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all focus:ring-2 focus:ring-white focus:outline-none shadow-lg"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold tracking-wide text-sm md:text-base">Back</span>
              </button>
              
              {type === 'tv' && (
                  <div className="px-4 py-2 md:px-6 md:py-3 rounded-lg bg-black/50 text-white font-mono backdrop-blur-md border border-white/10 select-none text-sm md:text-base">
                    S{season} : E{episode}
                  </div>
              )}
          </div>

          {/* Row 2: Source Selector (Stacked below Back Button) */}
          <div className="pointer-events-auto flex items-center gap-2 md:gap-3 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg mt-1">
              <div className="flex items-center gap-2 px-2 text-gray-300">
                  <Server size={14} className="md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm font-medium">Source</span>
              </div>
              <div className="relative">
                  <select
                      value={source}
                      onChange={(e) => handleSourceChange(e.target.value)}
                      className="appearance-none bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-medium py-2 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors border border-transparent w-28 md:w-32"
                  >
                      <option value="vidsrc" className="bg-gray-900 text-white">VidSrc</option>
                      <option value="cinemaos" className="bg-gray-900 text-white">CinemaOS</option>
                      <option value="rivestream" className="bg-gray-900 text-white">RiveStream</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/70">
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
