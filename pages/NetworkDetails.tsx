import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, getLogoUrl } from '../services/api';
import { NETWORK_MOVIE_MAPPING } from '../services/networks';
import { Network, ContentItem, Genre } from '../types';
import MediaCard from '../components/MediaCard';
import { ChevronDown, Filter, Globe, LayoutGrid, Film } from 'lucide-react';
import Meta from '../components/Meta';
import { CinematicBackground } from '../components/CinematicBackground';

type FilterType = 'tv' | 'movie';
type SortType = 'popularity.desc' | 'vote_average.desc' | 'first_air_date.desc';

const COUNTRIES = [
  { code: 'ALL', name: 'Global' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'FR', name: 'France' },
];

const NetworkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const networkId = parseInt(id || '0');

  const [network, setNetwork] = useState<Network | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filterType, setFilterType] = useState<FilterType>('tv');
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortType>('popularity.desc');

  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [netData, mGenres, tGenres] = await Promise.all([
          api.getNetwork(networkId),
          api.getGenres('movie'),
          api.getGenres('tv')
        ]);
        setNetwork(netData);
        setMovieGenres([{ id: 0, name: 'All Genres' }, ...mGenres]);
        setTvGenres([{ id: 0, name: 'All Genres' }, ...tGenres]);
      } catch (e) {
        console.error("Error fetching network info", e);
      }
    };
    if (networkId) fetchData();
  }, [networkId]);

  useEffect(() => {
    const fetchContent = async () => {
      if (page === 1) setLoading(true);
      try {
        let newContent: ContentItem[] = [];
        if (filterType === 'tv') {
          newContent = await api.discoverTvShows(page, selectedGenre, sortBy, networkId, selectedCountry);
        } else if (filterType === 'movie') {
          const mConfig = NETWORK_MOVIE_MAPPING[networkId];
          if (mConfig) {
            const opts: any = { country: selectedCountry };
            mConfig.type === 'provider' ? (opts.providerId = mConfig.value) : (opts.companyId = mConfig.value);
            newContent = await api.discoverMovies(page, selectedGenre, sortBy, opts);
          }
        }

        if (newContent.length === 0) {
          setHasMore(false);
          if (page === 1) setContent([]);
        } else {
          setContent(prev => page === 1 ? newContent : [...prev, ...newContent]);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (networkId) fetchContent();
  }, [page, filterType, selectedGenre, selectedCountry, sortBy, networkId]);

  const currentGenres = filterType === 'movie' ? movieGenres : tvGenres;

  return (
    <div className="relative min-h-screen">
      <CinematicBackground />
      <Meta title={`${network?.name || 'Studio'} | K-Flix`} />

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-32">
        <header className="flex flex-col md:flex-row items-center md:items-end gap-10 mb-16">
          <div className="w-40 h-28 md:w-56 md:h-36 bg-white rounded-[32px] p-8 flex items-center justify-center shadow-2xl shrink-0 border border-white/5">
            {network?.logo_path ? (
              <img src={getLogoUrl(network.logo_path)} alt={network.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-black font-black text-3xl uppercase tracking-tighter">{network?.name}</span>
            )}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter leading-none">{network?.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-white/20 font-bold uppercase tracking-widest text-[10px]">
              <span className="flex items-center gap-2"><Globe size={14} className="text-rose-500" /> {network?.origin_country || 'Global HQ'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
              <span className="text-rose-500">Classified Studio Production</span>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="sticky top-4 z-50 py-4 mb-16">
           <div className="bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/5 rounded-[32px] p-2 flex flex-col xl:flex-row gap-4 items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="bg-white/5 p-1 rounded-2xl flex gap-1 w-full xl:w-auto">
                 <button
                   onClick={() => { setFilterType('tv'); setPage(1); setContent([]); }}
                   className={`flex-1 xl:flex-none flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'tv' ? 'bg-white text-black' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                 >
                   <LayoutGrid size={16} />
                   Series
                 </button>
                 <button
                   onClick={() => { setFilterType('movie'); setPage(1); setContent([]); }}
                   className={`flex-1 xl:flex-none flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'movie' ? 'bg-white text-black' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                 >
                   <Film size={16} />
                   Movies
                 </button>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 w-full xl:flex-1">
                 <div className="relative group shrink-0 min-w-[180px]">
                    <select
                      value={selectedCountry}
                      onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); setContent([]); }}
                      className="appearance-none w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest outline-none focus:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-xl"
                    >
                      {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-[#0a0a0f]">{c.name}</option>)}
                    </select>
                    <Globe size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20" />
                 </div>

                 <div className="relative group shrink-0 min-w-[200px]">
                    <select
                      value={selectedGenre}
                      onChange={(e) => { setSelectedGenre(parseInt(e.target.value)); setPage(1); setContent([]); }}
                      className="appearance-none w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest outline-none focus:border-rose-500/50 hover:bg-white/10 transition-all cursor-pointer shadow-xl"
                    >
                      {currentGenres.map(g => <option key={g.id} value={g.id} className="bg-[#0a0a0f]">{g.name}</option>)}
                    </select>
                    <Filter size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20" />
                 </div>
              </div>
           </div>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            <AnimatePresence mode="popLayout">
                {content.map((item, index) => (
                    <MediaCard
                        key={`${item.id}-${index}`}
                        item={item}
                        variant="portrait"
                        onClick={() => navigate(`/details/${item.media_type || filterType}/${item.id}`)}
                        ref={content.length === index + 1 ? lastElementRef : null}
                    />
                ))}
            </AnimatePresence>
        </section>

        {loading && (
            <div className="flex justify-center py-20 w-full">
                <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-rose-500 animate-spin" />
            </div>
        )}
      </main>
    </div>
  );
};

export default NetworkDetails;
