import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Server, ChevronDown, Shield, RefreshCcw, Activity, Zap, Cpu, Settings, ExternalLink, Check } from 'lucide-react';
import { api } from '../services/api';
import { NavigationDirection } from '../types';

const SANDBOXED_SOURCE_ID = 'zxcstream';

const isAllowedPopupUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'about:blank') return true;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return false;
  return lower.includes('youtube.com') || lower.includes('youtu.be');
};

const SOURCES = [
  {
    id: 'vidcore',
    name: 'VidCore Prime',
    tag: 'Ultra',
    movie: (id: string) => `https://vidcore.net/movie/${id}?autoPlay=true`,
    tv: (id: string, s: string, e: string) => `https://vidcore.net/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'vidlink',
    name: 'VidLink Pro',
    tag: '4K Ready',
    movie: (id: string) => `https://vidlink.pro/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: 'peachify',
    name: 'Peachify Fast',
    tag: 'Instant',
    movie: (id: string) => `https://peachify.top/embed/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://peachify.top/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'zxcstream',
    name: 'ZxcStream Shield',
    tag: 'Ad-Free',
    movie: (id: string) => `https://zxcstream.xyz/player/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://zxcstream.xyz/player/tv/${id}/${s}/${e}`,
  },
  {
      id: 'anyembed',
      name: 'AnyEmbed Core',
      tag: 'Global',
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
  const [backdrop, setBackdrop] = useState<string>('');

  // Enhanced Shield Logic
  useEffect(() => {
    const originalOpen = window.open;
    (window as any).open = (...args: unknown[]) => {
      const url = String(args[0] ?? '');
      if (!isAllowedPopupUrl(url)) {
        console.info('[K-Flix Matrix Shield] Hijack prevented:', url);
        return null;
      }
      return originalOpen.apply(window, args as [string?, string?, string?]);
    };

    const blockSuspiciousLink = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.closest('iframe')) return;
      const href = anchor.getAttribute('href') ?? '';
      const opensNewTab = anchor.target === '_blank' || anchor.hasAttribute('download');
      if (opensNewTab && !isAllowedPopupUrl(href)) {
        e.preventDefault();
        e.stopPropagation();
        console.info('[K-Flix Matrix Shield] Navigation blocked:', href);
      }
    };

    document.addEventListener('click', blockSuspiciousLink, true);
    return () => {
      window.open = originalOpen;
      document.removeEventListener('click', blockSuspiciousLink, true);
    };
  }, []);

  useEffect(() => {
    const reset = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = window.setTimeout(() => {
        if (!showSourceMenu) setShowControls(false);
      }, 5000);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    reset();
    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [showSourceMenu]);

  useEffect(() => {
    if (!id) return;
    api.getDetails(id, type as 'movie' | 'tv').then(d => setBackdrop(d.backdrop_path || ''));
  }, [id, type]);

  if (!id) return null;

  const currentSource = SOURCES.find(s => s.id === source) || SOURCES[0];
  const iframeSandbox = source === SANDBOXED_SOURCE_ID
      ? 'allow-scripts allow-same-origin allow-presentation allow-forms'
      : undefined;

  const getEmbedUrl = () => type === 'tv' ? currentSource.tv(id, season, episode) : currentSource.movie(id);

  return (
    <div className="fixed inset-0 z-50 bg-[#020203] overflow-hidden flex items-center justify-center">
      
      {/* Dynamic Ambient Background */}
      {backdrop && (
        <div className="absolute inset-0 opacity-20 blur-[120px] pointer-events-none z-0">
          <img src={`https://image.tmdb.org/t/p/w1280${backdrop}`} alt="" className="w-full h-full object-cover scale-150" />
        </div>
      )}

      {/* Modern Player Wrapper */}
      <div className="relative w-full h-full lg:rounded-[40px] lg:m-8 lg:h-[calc(100%-64px)] lg:w-[calc(100%-64px)] overflow-hidden bg-black shadow-[0_0_100px_rgba(0,0,0,0.8)] z-10 border border-white/5">
        
        {/* Loader Overlay */}
        <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#020203] transition-opacity duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rose-500 animate-spin" />
                <Cpu className="absolute inset-0 m-auto text-rose-500/40 animate-pulse" size={24} />
            </div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[1em] animate-pulse">Initializing Uplink</p>
        </div>

        {/* Video Iframe */}
        <iframe
          ref={iframeRef}
          key={`${source}-${id}-${type}-${season}-${episode}`}
          src={getEmbedUrl()}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
          {...(iframeSandbox ? { sandbox: iframeSandbox } : {})}
          onLoad={() => setIsLoading(false)}
        />

        {/* Cinematic Controls Overlay */}
        <div className={`absolute inset-x-0 bottom-0 p-8 pt-20 transition-opacity duration-500 z-40 bg-gradient-to-t from-black via-black/40 to-transparent ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
                
                {/* Left: Metadata */}
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-3xl flex items-center justify-center text-white transition-all active:scale-95"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,1)]" />
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Streaming Terminal</p>
                        </div>
                        <h2 className="text-white font-black text-xl tracking-tight line-clamp-1">{type === 'tv' ? `S${season} • E${episode}` : 'Premiere Mode'}</h2>
                    </div>
                </div>

                {/* Right: Technical Controls */}
                <div className="flex items-center gap-3">
                    {/* Source Switcher */}
                    <div id="source-selector" className="relative">
                        <button
                            onClick={() => setShowSourceMenu(!showSourceMenu)}
                            className="h-14 px-8 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                        >
                            <Server size={18} />
                            {currentSource.name}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showSourceMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showSourceMenu && (
                            <div className="absolute right-0 bottom-full mb-4 w-72 p-2 rounded-3xl bg-zinc-900 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50">
                                {SOURCES.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setSource(s.id);
                                            setIsLoading(true);
                                            setShowSourceMenu(false);
                                            localStorage.setItem('player_source_pref', s.id);
                                        }}
                                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all group ${source === s.id ? 'bg-rose-500 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Zap size={16} className={source === s.id ? 'text-white' : 'text-rose-500'} />
                                            <div className="text-left">
                                                <p className="text-xs font-black uppercase tracking-wider">{s.name}</p>
                                                <p className={`text-[8px] font-bold uppercase opacity-60`}>{s.tag}</p>
                                            </div>
                                        </div>
                                        {source === s.id && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    
                    <div className="hidden md:flex items-center gap-3 px-6 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-500">
                        <Activity size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{iframeSandbox ? 'Sandboxed' : 'Protected'}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
