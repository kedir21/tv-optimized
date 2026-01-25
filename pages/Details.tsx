import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { MovieDetails, TvDetails, SeasonDetails, ContentItem } from '../types';
import TvButton from '../components/TvButton';
import Row from '../components/Row';
import { Play, Plus, Check, Star, Calendar, Clock, Layers, Tv, List, ChevronDown, X, Youtube, Info } from 'lucide-react';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const initialData = location.state?.movie as ContentItem | undefined;
  
  const [content, setContent] = useState<MovieDetails | TvDetails | null>(
    initialData ? (initialData as MovieDetails | TvDetails) : null
  );
  
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  const mediaType = (type as 'movie' | 'tv') || 'movie';

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      if (!initialData) setLoading(true);
      
      try {
        const data = await api.getDetails(id, mediaType);
        if (typeof data.id === 'string') data.id = parseInt(data.id);
        (data as any).media_type = mediaType;
        
        setContent(data);
        
        const inList = await watchlistService.isInWatchlist(data.id);
        setInWatchlist(inList);

        const recs = await api.getRecommendations(parseInt(id), mediaType);
        setRecommendations(recs);

        if (mediaType === 'tv' && 'seasons' in data && data.seasons && data.seasons.length > 0) {
            const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
            setSelectedSeasonNumber(firstSeason.season_number);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id, mediaType, user]);

  useEffect(() => {
    const fetchSeason = async () => {
      if (mediaType !== 'tv' || !content || !id) return;
      
      setLoadingSeason(true);
      try {
        const data = await api.getSeasonDetails(parseInt(id), selectedSeasonNumber);
        setSeasonDetails(data);
      } catch (e) {
        console.error("Failed to load season", e);
      } finally {
        setLoadingSeason(false);
      }
    };

    fetchSeason();
  }, [selectedSeasonNumber, content?.id, mediaType]);

  useEffect(() => {
    const handleUpdate = async () => {
      if (content) {
        const inList = await watchlistService.isInWatchlist(content.id);
        setInWatchlist(inList);
      }
    };
    window.addEventListener('watchlist-updated', handleUpdate);
    return () => window.removeEventListener('watchlist-updated', handleUpdate);
  }, [content, user]);

  const toggleWatchlist = async () => {
    if (content) {
      setInWatchlist(prev => !prev);
      await watchlistService.toggleWatchlist(content as any);
    }
  };

  const playEpisode = (season: number, episode: number) => {
    if (!content) return;
    navigate(`/watch/${content.id}?type=tv&s=${season}&e=${episode}`);
  };
  
  const safeContent = content || {} as any;
  const title = 'title' in safeContent ? safeContent.title : safeContent.name;
  const releaseDate = 'release_date' in safeContent ? safeContent.release_date : safeContent.first_air_date;
  const runtime = 'runtime' in safeContent ? safeContent.runtime : (safeContent.episode_run_time?.[0] || 0);
  const voteAverage = safeContent.vote_average || 0;
  const genres = safeContent.genres || [];
  const trailer = safeContent.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

  if (loading && !content) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 font-sans overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-black z-10 opacity-30 lg:opacity-20" />
        <img 
          src={getImageUrl(safeContent.backdrop_path)} 
          alt={title}
          className="w-full h-full object-cover scale-110 animate-slow-zoom brightness-[0.3] contrast-125 blur-[2px] lg:blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 lg:via-black/60 z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30 lg:via-transparent lg:to-black/40 z-20" />
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-2 sm:p-4 md:p-6 animate-in fade-in duration-300">
            <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-[110]"
            >
                <X size={24} className="sm:w-8 sm:h-8" />
            </button>
            <div className="w-full max-w-2xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl aspect-video rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <iframe 
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
            </div>
        </div>
      )}

      <div className="relative z-30 pt-4 sm:pt-8 lg:pt-12 pb-8 sm:pb-16 lg:pb-32 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 lg:items-start">
          
          {/* Left: Poster & Main Actions - Mobile First */}
          <div className="w-full lg:w-80 xl:w-96 2xl:w-[420px] flex-shrink-0 flex flex-col items-center lg:items-start space-y-6 sm:space-y-8 lg:sticky lg:top-6 xl:top-8">
            {/* Poster Container */}
            <div className="relative group rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.15)] lg:shadow-[0_0_50px_rgba(220,38,38,0.15)] border border-white/10 w-full max-w-[280px] sm:max-w-[340px] lg:max-w-none">
              <img 
                src={getPosterUrl(safeContent.poster_path)} 
                alt={title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                style={{ viewTransitionName: 'shared-poster' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-4 max-w-[280px] sm:max-w-[340px] lg:max-w-none">
               <TvButton 
                id="details-play-btn"
                variant="primary" 
                icon={<Play fill="white" size={20} className="sm:w-6 sm:h-6" />}
                className="w-full h-14 sm:h-16 text-lg sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl shadow-red-600/40 transform hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tighter italic"
                onClick={() => {
                  if (mediaType === 'tv') {
                      playEpisode(selectedSeasonNumber, 1);
                  } else {
                      navigate(`/watch/${safeContent.id}?type=movie`);
                  }
                }}
              >
                {mediaType === 'movie' ? 'Watch Now' : `Start S${selectedSeasonNumber.toString().padStart(2, '0')}`}
              </TvButton>
              
              <div className="grid grid-cols-2 gap-3">
                <TvButton 
                    variant={inWatchlist ? "secondary" : "glass"}
                    icon={inWatchlist ? <Check size={18} className="sm:w-5 sm:h-5" /> : <Plus size={18} className="sm:w-5 sm:h-5" />}
                    className={`h-12 sm:h-14 font-bold rounded-xl sm:rounded-2xl backdrop-blur-2xl border ${inWatchlist ? 'border-red-600/50 bg-red-600/20' : 'border-white/10 hover:bg-white/10'}`}
                    onClick={toggleWatchlist}
                >
                    {inWatchlist ? "In List" : "My List"}
                </TvButton>
                
                {trailer && (
                    <TvButton 
                        variant="glass"
                        icon={<Youtube size={18} className="sm:w-5 sm:h-5" />}
                        className="h-12 sm:h-14 font-bold rounded-xl sm:rounded-2xl backdrop-blur-2xl border border-white/10 hover:bg-white/10"
                        onClick={() => setShowTrailer(true)}
                    >
                        Trailer
                    </TvButton>
                )}
              </div>
            </div>

            {/* Side Info Cards - Desktop Only */}
            <div className="w-full hidden lg:grid grid-cols-1 gap-4 pt-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 xl:p-5 rounded-2xl xl:rounded-3xl space-y-1">
                    <p className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.15em] xl:tracking-[0.2em] text-white/40">Status</p>
                    <p className="text-base xl:text-lg font-bold truncate">{safeContent.status}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 xl:p-5 rounded-2xl xl:rounded-3xl space-y-1">
                    <p className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.15em] xl:tracking-[0.2em] text-white/40">Network / Studio</p>
                    <p className="text-base xl:text-lg font-bold truncate">
                        {mediaType === 'tv' ? safeContent.networks?.[0]?.name : safeContent.production_companies?.[0]?.name || 'N/A'}
                    </p>
                </div>
            </div>
          </div>

          {/* Right: Rich Content */}
          <div className="flex-1 space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Title & Basic Info */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-red-600 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase shadow-lg shadow-red-600/20">
                  {mediaType === 'movie' ? 'Cinematic Release' : 'Original Series'}
                </span>
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/10">
                  <Star size={14} className="sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  <span className="font-black text-white text-sm sm:text-base">{voteAverage.toFixed(1)}</span>
                </div>
                {safeContent.content_ratings?.results?.find((r:any) => r.iso_3166_1 === 'US') && (
                    <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/10 font-black text-xs sm:text-sm">
                        {safeContent.content_ratings.results.find((r:any) => r.iso_3166_1 === 'US').rating}
                    </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[7.5rem] font-black tracking-tighter leading-[0.9] sm:leading-[0.8] uppercase italic drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] sm:drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 text-white/60 text-sm sm:text-base lg:text-xl font-medium tracking-tight">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Calendar size={16} className="sm:w-5 sm:h-5 text-red-600" />
                  <span>{releaseDate ? releaseDate.split('-')[0] : 'N/A'}</span>
                </div>
                {mediaType === 'movie' ? (
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <Clock size={16} className="sm:w-5 sm:h-5 text-red-600" />
                    <span>{Math.floor(runtime / 60)}h {runtime % 60}m</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <Layers size={16} className="sm:w-5 sm:h-5 text-red-600" />
                    <span>{safeContent.number_of_seasons} Season{safeContent.number_of_seasons !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-2 sm:mt-0">
                  {genres.slice(0, 3).map((g: any) => (
                    <span key={g.id} className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold backdrop-blur-xl hover:bg-white/10 transition-colors cursor-default">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tagline */}
            {safeContent.tagline && (
              <div className="relative overflow-hidden p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm group">
                <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-red-600" />
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white font-black italic tracking-tight leading-snug sm:leading-snug group-hover:translate-x-1 transition-transform">
                  "{safeContent.tagline}"
                </p>
              </div>
            )}

            {/* Overview */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4">
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/30">The Story</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/80 leading-[1.6] sm:leading-[1.6] max-w-4xl xl:max-w-5xl font-medium antialiased">
                {safeContent.overview}
              </p>
            </div>

            {/* Casting Section */}
            {safeContent.credits?.cast && safeContent.credits.cast.length > 0 && (
              <div className="space-y-4 sm:space-y-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/30">Casting</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 sm:pb-6 px-2 -mx-2">
                  {safeContent.credits.cast.slice(0, 12).map((person: any) => (
                    <div key={person.id} className="group flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44 text-center space-y-3 sm:space-y-4">
                      <div className="relative aspect-[4/5] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-white/5 group-hover:border-red-600 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] sm:group-hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all duration-500 bg-white/5">
                        {person.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                            alt={person.name}
                            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[10px] text-white/20 font-black uppercase tracking-widest">No Profile</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 sm:bottom-3 inset-x-2 sm:inset-x-3">
                            <p className="text-xs sm:text-sm font-black text-white line-clamp-1 uppercase tracking-tighter">{person.name}</p>
                        </div>
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest line-clamp-1 italic">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes Section (TV Shows Only) */}
            {mediaType === 'tv' && safeContent.seasons && (
              <div className="space-y-6 sm:space-y-10 pt-8 sm:pt-12 lg:pt-16 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 lg:gap-8">
                  <div className="space-y-1 sm:space-y-2">
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/30">Explore</h2>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter">Episodes</h3>
                  </div>
                  <div className="relative group">
                    <select
                      value={selectedSeasonNumber}
                      onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                      className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-6 sm:pl-8 pr-12 sm:pr-16 text-white font-black uppercase tracking-wider sm:tracking-widest text-xs focus:outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-pointer w-full sm:w-auto min-w-[200px] sm:min-w-[240px] shadow-xl sm:shadow-2xl"
                    >
                      {safeContent.seasons.map((season: any) => (
                        <option key={season.id} value={season.season_number} className="bg-slate-950 text-white font-sans">
                          {season.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="sm:w-5 sm:h-5 absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-red-600 group-hover:scale-125 transition-transform pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
                  {loadingSeason ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 lg:py-32 space-y-3 sm:space-y-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-[4px] sm:border-[6px] border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-white/20">Loading Intel</p>
                    </div>
                  ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
                    seasonDetails.episodes.map((episode) => (
                      <div 
                        key={episode.id}
                        onClick={() => playEpisode(episode.season_number, episode.episode_number)}
                        className="group flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/30 transition-all cursor-pointer overflow-hidden shadow-xl sm:shadow-2xl relative"
                      >
                        <div className="w-full md:w-72 lg:w-80 xl:w-96 aspect-video rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden flex-shrink-0 relative shadow-lg sm:shadow-2xl bg-black border border-white/5">
                          {episode.still_path ? (
                            <img 
                              src={getStillUrl(episode.still_path)} 
                              alt={episode.name}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900"><Tv size={32} className="sm:w-12 sm:h-12 text-white/5" /></div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="bg-red-600 p-3 sm:p-4 lg:p-5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.8)] sm:shadow-[0_0_40px_rgba(220,38,38,0.8)] scale-75 group-hover:scale-100 transition-all duration-500">
                              <Play fill="white" size={20} className="sm:w-7 sm:h-7" />
                            </div>
                          </div>
                          {episode.runtime && (
                            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1 bg-black/80 backdrop-blur-xl rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">
                              {episode.runtime}m
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2 sm:space-y-3 lg:space-y-4 py-1 sm:py-2">
                          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                            <span className="text-red-600 font-black text-lg sm:text-xl lg:text-2xl tracking-tighter uppercase italic">EP {episode.episode_number.toString().padStart(2, '0')}</span>
                            <h4 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black group-hover:text-red-500 transition-colors tracking-tighter leading-none">{episode.name}</h4>
                          </div>
                          <p className="text-white/50 text-sm sm:text-base lg:text-lg line-clamp-2 sm:line-clamp-3 font-medium leading-relaxed tracking-tight">
                            {episode.overview || "Transmission details classified. Plot data unavailable."}
                          </p>
                          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/20">
                              <span>Air Date: {episode.air_date || 'TBA'}</span>
                              <div className="w-1 h-1 bg-white/10 rounded-full" />
                              <span>Rating: {episode.vote_average?.toFixed(1) || 'NR'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 sm:py-24 lg:py-32 text-center">
                        <p className="text-xs sm:text-sm font-black uppercase tracking-[0.5em] sm:tracking-[0.8em] text-white/10">No Data Available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
           <div className="mt-12 sm:mt-20 lg:mt-32 -mx-3 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16 2xl:-mx-20 pt-8 sm:pt-12 lg:pt-16 border-t border-white/10">
             <div className="px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 mb-6 sm:mb-8">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/30 mb-1 sm:mb-2">Simulation</h2>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">Related Content</h3>
             </div>
             <Row 
               title="" 
               items={recommendations} 
               onItemSelect={(rec) => navigate(`/details/${mediaType}/${rec.id}`, { state: { movie: rec } })} 
             />
           </div>
        )}
      </div>
    </div>
  );
};

export default Details;
