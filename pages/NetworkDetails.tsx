
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getLogoUrl } from '../services/api';
import { NETWORK_MOVIE_MAPPING } from '../services/networks';
import { Network, ContentItem, Genre } from '../types';
import MovieCard from '../components/MovieCard';
import { MovieCardSkeleton } from '../components/Skeletons';
import { ChevronDown, Filter, Globe, Calendar, Star, SlidersHorizontal, Check } from 'lucide-react';

type FilterType = 'tv' | 'movie';
type SortType = 'popularity.desc' | 'vote_average.desc' | 'first_air_date.desc';

const COUNTRIES = [
    { code: 'ALL', name: 'Global' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'KR', name: 'South Korea' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'DE', name: 'Germany' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' }
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
  
  // Filters
  const [filterType, setFilterType] = useState<FilterType>('tv');
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortType>('popularity.desc');
  
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);

  // Infinite Scroll Observer
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

  // Initial Data Fetch
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

  // Handle Tab Switch
  const handleTabChange = (type: FilterType) => {
      if (type === filterType) return;
      
      setFilterType(type);
      setSelectedGenre(0); 
      setPage(1);
      setContent([]);
      setHasMore(true);
      // We keep selectedCountry active as it's relevant for both
  };

  // Fetch Content Logic
  useEffect(() => {
    const fetchContent = async () => {
      if (page === 1) setLoading(true);

      try {
        let newContent: ContentItem[] = [];
        
        if (filterType === 'tv') {
             const res = await api.discoverTvShows(page, selectedGenre, sortBy, networkId, selectedCountry);
             newContent = res;
        } else if (filterType === 'movie') {
             const movieConfig = NETWORK_MOVIE_MAPPING[networkId];
             
             if (movieConfig) {
                 const options: any = { country: selectedCountry };
                 
                 if (movieConfig.type === 'provider') {
                     options.providerId = movieConfig.value;
                 } else {
                     options.companyId = movieConfig.value;
                 }
                 
                 const res = await api.discoverMovies(page, selectedGenre, sortBy, options);
                 newContent = res;
             } else {
                 // Fallback: If no specific mapping, we might return empty or try a loose search.
                 // For now, return empty to avoid junk data.
                 newContent = []; 
             }
        }

        if (newContent.length === 0) {
          setHasMore(false);
          if (page === 1) setContent([]);
        } else {
            setContent(prev => {
                if (page === 1) return newContent;
                const existingIds = new Set(prev.map(i => i.id));
                const uniqueNew = newContent.filter(i => !existingIds.has(i.id));
                return [...prev, ...uniqueNew];
            });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (networkId) fetchContent();
  }, [page, filterType, selectedGenre, selectedCountry, sortBy, networkId]);

  const currentGenres = filterType === 'movie' ? movieGenres : tvGenres;

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-20 pb-24 md:pl-24 md:pt-12 md:pr-12 md:pb-12">
       {/* Hero / Header */}
       <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-8 md:mb-10 pb-8 border-b border-white/5">
          <div className="w-32 h-32 md:w-48 md:h-32 bg-white rounded-xl p-4 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-transparent opacity-50" />
              {network?.logo_path ? (
                  <img src={getLogoUrl(network.logo_path)} alt={network.name} className="max-w-full max-h-full object-contain relative z-10" />
              ) : (
                  <h1 className="text-black font-bold text-xl relative z-10">{network?.name}</h1>
              )}
          </div>
          <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{network?.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm md:text-base">
                  <span className="flex items-center gap-1"><Globe size={14} /> {network?.origin_country || 'Global'}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                  <span className="text-red-500 font-bold uppercase tracking-wide">Network</span>
              </div>
          </div>
       </div>

       {/* Premium Filter Bar */}
       <div className="sticky top-16 md:top-0 z-40 -mx-4 px-4 md:-mx-12 md:px-12 mb-8 transition-all">
           <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col xl:flex-row gap-3 justify-between items-center max-w-[1920px] mx-auto">
               
               {/* Tab Switcher - Pill Design */}
               <div className="bg-black/50 p-1 rounded-xl flex gap-1 w-full xl:w-auto relative">
                   <button
                    onClick={() => handleTabChange('tv')}
                    className={`relative z-10 flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 focusable tv-focus ${
                        filterType === 'tv' 
                        ? 'bg-white text-black shadow-lg shadow-white/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                   >
                       TV Shows
                   </button>
                   <button
                    onClick={() => handleTabChange('movie')}
                    className={`relative z-10 flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 focusable tv-focus ${
                        filterType === 'movie' 
                        ? 'bg-white text-black shadow-lg shadow-white/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                   >
                       Movies
                   </button>
               </div>

               {/* Dropdown Filters */}
               <div className="flex flex-wrap items-center justify-end gap-2 w-full xl:w-auto">
                   
                   {/* Country */}
                   <div className="relative group flex-grow md:flex-grow-0 min-w-[150px]">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                           <Globe size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                       </div>
                       <select 
                        value={selectedCountry} 
                        onChange={(e) => {
                            setSelectedCountry(e.target.value);
                            setPage(1);
                            setContent([]);
                        }}
                        className="appearance-none w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white text-xs md:text-sm rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all cursor-pointer focusable tv-focus font-medium"
                       >
                           {COUNTRIES.map(c => (
                               <option key={c.code} value={c.code} className="bg-slate-900 text-white">{c.name}</option>
                           ))}
                       </select>
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown size={14} className="text-gray-500" />
                       </div>
                   </div>

                   {/* Genre */}
                   <div className="relative group flex-grow md:flex-grow-0 min-w-[170px]">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <div className="text-[10px] font-bold border border-gray-400 group-hover:border-white text-gray-400 group-hover:text-white px-1 rounded transition-colors">G</div>
                        </div>
                       <select 
                        value={selectedGenre} 
                        onChange={(e) => {
                            setSelectedGenre(parseInt(e.target.value));
                            setPage(1);
                            setContent([]);
                        }}
                        className="appearance-none w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white text-xs md:text-sm rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all cursor-pointer focusable tv-focus font-medium"
                       >
                           {currentGenres.map(g => (
                               <option key={g.id} value={g.id} className="bg-slate-900 text-white">{g.name}</option>
                           ))}
                       </select>
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown size={14} className="text-gray-500" />
                       </div>
                   </div>

                   {/* Sort */}
                   <div className="relative group flex-grow md:flex-grow-0 min-w-[170px]">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                           <Filter size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                       </div>
                       <select 
                        value={sortBy} 
                        onChange={(e) => {
                            setSortBy(e.target.value as SortType);
                            setPage(1);
                            setContent([]);
                        }}
                        className="appearance-none w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white text-xs md:text-sm rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all cursor-pointer focusable tv-focus font-medium"
                       >
                           <option value="popularity.desc">Most Popular</option>
                           <option value="vote_average.desc">Highest Rated</option>
                           <option value="first_air_date.desc">Newest First</option>
                       </select>
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown size={14} className="text-gray-500" />
                       </div>
                   </div>
               </div>
           </div>
       </div>

       {/* Content Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {loading && page === 1 ? (
           [...Array(12)].map((_, i) => <MovieCardSkeleton key={i} className="w-full h-full" />)
        ) : (
          content.map((item, index) => {
            const isLast = content.length === index + 1;
            const uniqueKey = `${item.id}-${index}`;
            const mediaType = filterType === 'movie' ? 'movie' : 'tv';
            
            return (
                <div ref={isLast ? lastElementRef : null} key={uniqueKey} className="animate-in fade-in duration-500">
                  <MovieCard 
                    movie={{...item, media_type: item.media_type || mediaType}} 
                    onClick={() => navigate(`/details/${item.media_type || mediaType}/${item.id}`)} 
                    className="w-full h-full"
                  />
                </div>
              );
          })
        )}
      </div>
      
      {loading && page > 1 && (
        <div className="flex justify-center py-10 w-full">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && content.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Filter size={40} className="opacity-50 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">No content found</h3>
              <p className="max-w-md text-center text-gray-400">
                We couldn't find any {filterType === 'movie' ? 'movies' : 'TV shows'} matching your filters for this network. 
                <br /><span className="text-sm opacity-70 mt-2 block">Try changing the country or genre.</span>
              </p>
          </div>
      )}
    </div>
  );
};

export default NetworkDetails;
