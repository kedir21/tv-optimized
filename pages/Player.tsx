import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Server, ChevronDown, RefreshCcw, Zap, Check, Monitor, Layout, Maximize2 } from 'lucide-react';
import { api } from '../services/api';

const SOURCES = [
  {
    id: 'vidcore',
    name: 'VidCore Prime',
    tag: 'ULTRA',
    movie: (id: string) => `https://vidcore.net/movie/${id}?autoPlay=true`,
    tv: (id: string, s: string, e: string) => `https://vidcore.net/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'vidlink',
    name: 'VidLink Pro',
    tag: '4K READY',
    movie: (id: string) => `https://vidlink.pro/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: 'peachify',
    name: 'Peachify Fast',
    tag: 'INSTANT',
    movie: (id: string) => `https://peachify.top/embed/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://peachify.top/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'zxcstream',
    name: 'ZxcStream Shield',
    tag: 'AD-FREE',
    movie: (id: string) => `https://zxcstream.xyz/player/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://zxcstream.xyz/player/tv/${id}/${s}/${e}`,
  },
  {
      id: 'anyembed',
      name: 'AnyEmbed Core',
      tag: 'GLOBAL',
      movie: (id: string) => `https://anyembed.xyz/embed/tmdb-movie-${id}`,
      tv: (id: string, s: string, e: string) => `https://anyembed.xyz/embed/tmdb-tv-${id}-${s}-${e}`,
    },
];

const Player: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showControls, setShowControls] = useState(true);
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';

  const [source, setSource] = useState(() => {
    const saved = localStorage.getItem('player_source_pref');
    if (saved && SOURCES.some(s => s.id === saved)) return saved;
    return 'vidcore';
  });

  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const controlsTimeout = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const reset = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = window.setTimeout(() => {
        if (!showSourceMenu) setShowControls(false);
      }, 3500);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('touchstart', reset);
    reset();
    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('touchstart', reset);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [showSourceMenu]);

  useEffect(() => {
    if (!id) return;
    api.getDetails(id, type as 'movie' | 'tv').then(d => {
      const data = d as any;
      setTitle(data.title || data.name || '');
    });
  }, [id, type]);

  if (!id) return null;

  const currentSource = SOURCES.find(s => s.id === source) || SOURCES[0];
  const getEmbedUrl = () => type === 'tv' ? currentSource.tv(id, season, episode) : currentSource.movie(id);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center font-sans">
      
      {/* Video Iframe - Without Restrictions */}
      <iframe
        ref={iframeRef}
        key={`${source}-${id}-${type}-${season}-${episode}`}
        src={getEmbedUrl()}
        className="w-full h-full border-0 absolute inset-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
      />

      {/* Floating UI Layer - Uses pointer-events-none to let iframe interaction pass through */}
      <div className={`absolute inset-0 z-40 transition-opacity duration-700 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top Bar */}
        <div className="absolute top-0 inset-x-0 p-6 md:p-10 flex items-start justify-between bg-gradient-to-b from-black/80 via-black/20 to-transparent">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90 border border-white/10"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg md:text-xl tracking-tight line-clamp-1">{title}</h1>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                {type === 'tv' ? `Season ${season} • Episode ${episode}` : 'Feature Film'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button 
              onClick={() => window.location.reload()}
              className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10"
              title="Reload Player"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Floating Controls */}
        <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 flex justify-center items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <div className="flex flex-col items-center gap-6 pointer-events-auto">
            
            {/* Source Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="h-12 px-6 rounded-full glass-strong border border-white/10 flex items-center gap-3 text-white transition-all hover:border-white/20 active:scale-95 shadow-2xl"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{currentSource.name}</span>
                <ChevronDown size={14} className={`transition-transform duration-500 ${showSourceMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSourceMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 glass-strong p-2 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] slide-up">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">Select Uplink</p>
                  </div>
                  {SOURCES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSource(s.id);
                        setIsLoading(true);
                        setShowSourceMenu(false);
                        localStorage.setItem('player_source_pref', s.id);
                      }}
                      className={`w-full p-3 rounded-xl flex items-center justify-between transition-all group ${source === s.id ? 'bg-rose-500/10 text-rose-500' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Zap size={14} className={source === s.id ? 'text-rose-500' : 'text-white/20 group-hover:text-rose-500/50'} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider">{s.name}</p>
                          <p className="text-[8px] font-medium opacity-50">{s.tag}</p>
                        </div>
                      </div>
                      {source === s.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Minimal Indicators */}
            <div className="flex items-center gap-8 text-white/20">
               <div className="flex items-center gap-2">
                  <Monitor size={12} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Cinema Pro 2.0</span>
               </div>
               <div className="flex items-center gap-2">
                  <Layout size={12} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Optimized View</span>
               </div>
               <div className="hidden md:flex items-center gap-2">
                  <Maximize2 size={12} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Immersive Mode</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Loader Overlay */}
      <div className={`absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#020203] transition-all duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-[1px] border-white/5" />
              <div className="absolute inset-0 rounded-full border-[1px] border-transparent border-t-rose-500 animate-spin" />
              <div className="absolute inset-4 rounded-full border-[1px] border-white/5 animate-pulse" />
          </div>
          <div className="mt-8 space-y-2 text-center">
             <p className="text-[9px] font-black text-white/20 uppercase tracking-[1em] animate-pulse">Establishing Connection</p>
             <div className="w-32 h-[1px] bg-white/5 mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-rose-500/40 w-1/2 shimmer" />
             </div>
          </div>
      </div>
    </div>
  );
};

export default Player;

