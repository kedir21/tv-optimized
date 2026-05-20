import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Server, ChevronDown, Shield } from 'lucide-react';
import { api } from '../services/api';
import { NavigationDirection } from '../types';

/** Only ZxcStream uses iframe sandbox (blocks embed popups). Other sources rely on parent shields. */
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
    name: 'VidCore',
    tag: 'Default',
    movie: (id: string) => `https://vidcore.net/movie/${id}?autoPlay=true`,
    tv: (id: string, s: string, e: string) => `https://vidcore.net/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'peachify',
    name: 'Peachify',
    tag: 'Fast',
    movie: (id: string) => `https://peachify.top/embed/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://peachify.top/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'zxcstream',
    name: 'ZxcStream',
    tag: 'Stable',
    movie: (id: string) => `https://zxcstream.xyz/player/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://zxcstream.xyz/player/tv/${id}/${s}/${e}`,
  },
  {
    id: 'xpass',
    name: 'XPass',
    tag: 'HD',
    movie: (id: string) => `https://play.xpass.top/e/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://play.xpass.top/e/tv/${id}/${s}/${e}`,
  },
  {
    id: 'anyembed',
    name: 'AnyEmbed',
    tag: 'Backup',
    movie: (id: string) => `https://anyembed.xyz/embed/tmdb-movie-${id}`,
    tv: (id: string, s: string, e: string) => `https://anyembed.xyz/embed/tmdb-tv-${id}-${s}-${e}`,
  },
  {
    id: 'vidrock',
    name: 'VidRock',
    tag: 'Alt',
    movie: (id: string) => `https://vidrock.ru/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://vidrock.ru/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidflix',
    name: 'VidFlix',
    tag: 'Mirror',
    movie: (id: string) => `https://vidflix.club/movie/${id}`,
    tv: (id: string, s: string, e: string) => `https://vidflix.club/tv/${id}/${s}/${e}`,
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

  // Parent-window shields (blocks hijacks on this page; embed popups need sandbox or an ad blocker)
  useEffect(() => {
    const originalOpen = window.open;
    (window as any).open = (...args: unknown[]) => {
      const url = String(args[0] ?? '');
      if (!isAllowedPopupUrl(url)) {
        console.info('[KK-Flix Shield] Popup blocked:', url);
        return null;
      }
      return originalOpen.apply(window, args as [string?, string?, string?]);
    };

    const blockSuspiciousLink = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]');
      if (!anchor || anchor.closest('iframe')) return;
      const href = anchor.getAttribute('href') ?? '';
      const opensNewTab = anchor.target === '_blank' || anchor.hasAttribute('download');
      if (opensNewTab && !isAllowedPopupUrl(href)) {
        e.preventDefault();
        e.stopPropagation();
        console.info('[KK-Flix Shield] Link blocked:', href);
      }
    };

    document.addEventListener('click', blockSuspiciousLink, true);
    document.addEventListener('auxclick', blockSuspiciousLink, true);

    return () => {
      window.open = originalOpen;
      document.removeEventListener('click', blockSuspiciousLink, true);
      document.removeEventListener('auxclick', blockSuspiciousLink, true);
    };
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const reset = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
        setShowSourceMenu(false);
      }, 5000);
    };
    reset();
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('touchstart', reset);
    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('touchstart', reset);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === NavigationDirection.ESCAPE || e.key === NavigationDirection.BACK) {
        e.preventDefault();
        navigate(`/details/${type}/${id}`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, type, id]);

  useEffect(() => {
    document.getElementById('player-back-btn')?.focus();
  }, []);

  useEffect(() => {
    if (!id) return;
    api.getDetails(id, type as 'movie' | 'tv')
      .then(d => { if (d.backdrop_path) setBackdrop(d.backdrop_path); })
      .catch(() => {});
  }, [id, type]);

  useEffect(() => {
    if (!showSourceMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#source-selector')) {
        setShowSourceMenu(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showSourceMenu]);

  if (!id) return null;

  const currentSource = SOURCES.find(s => s.id === source) || SOURCES[0];
  const iframeSandbox =
    source === SANDBOXED_SOURCE_ID
      ? 'allow-scripts allow-same-origin allow-presentation allow-forms'
      : undefined;

  const getEmbedUrl = () =>
    type === 'tv'
      ? currentSource.tv(id, season, episode)
      : currentSource.movie(id);

  const handleSourceChange = (newSourceId: string) => {
    setSource(newSourceId);
    setIsLoading(true);
    setShowSourceMenu(false);
    localStorage.setItem('player_source_pref', newSourceId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Ambient Background */}
      {backdrop && (
        <div className="absolute inset-x-0 top-0 h-1/3 opacity-20 blur-[80px] pointer-events-none z-0 select-none">
          <img src={`https://image.tmdb.org/t/p/w1280${backdrop}`} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Loading */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 animate-spin"></div>
        </div>
        <h2 className="text-white/40 font-medium text-xs tracking-widest uppercase">Loading {currentSource.name}</h2>
      </div>

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        key={`${source}-${id}-${type}-${season}-${episode}`}
        src={getEmbedUrl()}
        className="w-full h-full border-0 absolute inset-0 z-10"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer"
        {...(iframeSandbox ? { sandbox: iframeSandbox } : {})}
        title="Content Player"
        onLoad={() => setIsLoading(false)}
      />

      {/* Controls */}
      <div className={`fixed inset-x-0 top-0 pointer-events-none transition-opacity duration-500 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 h-32 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />

        <div className="relative pt-[calc(1rem+env(safe-area-inset-top))] px-4 md:px-8 pb-4 flex flex-wrap items-center gap-2.5 w-full max-w-[1600px] mx-auto pointer-events-auto">

          {/* Back */}
          <button
            id="player-back-btn"
            onClick={() => navigate(`/details/${type}/${id}`)}
            className="group flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2.5 rounded-xl glass text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <ArrowLeft size={16} className="md:mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="hidden md:inline text-sm font-medium">Back</span>
          </button>

          {/* Season/Episode */}
          {type === 'tv' && (
            <div className="flex items-center px-3 py-2 rounded-xl glass text-white/70 font-semibold text-xs tracking-wider">
              <span>S{season}</span>
              <span className="mx-2 text-rose-400">•</span>
              <span>E{episode}</span>
            </div>
          )}

          <div className="flex-1" />

          {/* Source Selector */}
          <div id="source-selector" className="relative">
            <button
              onClick={() => setShowSourceMenu(!showSourceMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 text-xs font-medium"
            >
              <Server size={14} className="text-rose-400" />
              <span className="hidden sm:inline">{currentSource.name}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showSourceMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSourceMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50">
                <div className="px-3 py-2.5 border-b border-white/[0.04]">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/30 uppercase tracking-wider">
                    <Shield size={10} />
                    Select Source
                  </div>
                </div>
                {SOURCES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSourceChange(s.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all hover:bg-white/[0.04] active:bg-white/[0.08] ${
                      source === s.id
                        ? 'bg-rose-500/8 text-rose-300'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${source === s.id ? 'bg-rose-400' : 'bg-white/[0.08]'}`} />
                      <span className="font-medium text-xs">{s.name}</span>
                    </div>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      s.tag === 'Default' || s.tag === 'Cleanest'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : s.tag === 'Low Ads'
                        ? 'text-blue-400 bg-blue-500/10'
                        : s.tag === 'Multi-Server'
                        ? 'text-purple-400 bg-purple-500/10'
                        : 'text-white/30 bg-white/[0.04]'
                    }`}>
                      {s.tag}
                    </span>
                  </button>
                ))}
                <div className="px-3 py-2.5 border-t border-white/[0.04]">
                  <p className="text-[10px] text-white/20 leading-relaxed">
                    Use <strong className="text-white/35">uBlock Origin</strong> for best results.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Shield badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-emerald-400/60 text-[10px] font-medium tracking-wider uppercase">
            <Shield size={12} />
            {iframeSandbox ? 'Sandboxed' : 'Shielded'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
