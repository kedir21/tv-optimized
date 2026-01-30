import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { MovieDetails, TvDetails, SeasonDetails, ContentItem } from '../types';
import TvButton from '../components/TvButton';
import Row from '../components/Row';
import { Play, Plus, Check, Star, Calendar, Clock, Layers, Tv, ChevronDown, X, Youtube, Users, Globe, Award, Film, BookOpen, Sparkles, Share2, Heart, AlertCircle } from 'lucide-react';

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
  const [isHoveringPlay, setIsHoveringPlay] = useState(false);
  
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'episodes' | 'details'>('overview');
  const [showNotification, setShowNotification] = useState(false);

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
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-[#1CE783]/20 rounded-full animate-spin" />
        <div className="w-20 h-20 border-4 border-[#1CE783] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        <div className="absolute -inset-4 bg-gradient-to-r from-[#1CE783]/10 to-transparent blur-xl" />
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white font-sans overflow-x-hidden">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-right-10 duration-300">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-xl border border-gray-700 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1CE783]/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-[#1CE783]" />
            </div>
            <div>
              <p className="font-semibold">Added to My Stuff</p>
              <p className="text-sm text-white/60">Content saved to your watchlist</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Background with Hulu-inspired gradient */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-gray-950 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-20" />
        <img 
          src={getImageUrl(safeContent.backdrop_path)} 
          alt={title}
          className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950 z-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1CE783]/30 to-transparent z-40" />
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setShowTrailer(false)}
            className="absolute top-6 right-6 p-3 bg-gray-900/90 hover:bg-gray-800/90 rounded-full transition-all z-[110] backdrop-blur-xl border border-gray-700 group"
          >
            <X size={24} className="group-hover:scale-110 transition-transform" />
          </button>
          <div className="w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1CE783]/10 via-transparent to-purple-500/10" />
            <iframe 
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0&controls=1&showinfo=0`}
              className="w-full h-full relative z-10"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={`${title} Trailer`}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-30">
        {/* Hero Section - Enhanced Hulu-style */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-14">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-16">
            
            {/* Poster & Actions - Mobile Optimized */}
            <div className="lg:w-1/3 xl:w-1/4 flex flex-col items-center lg:items-start">
              <div className="w-full max-w-xs sm:max-w-sm lg:max-w-none">
                {/* Poster with Hulu-inspired border */}
                <div className="relative group rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl hover:shadow-[#1CE783]/20 transition-all duration-500 mb-6 lg:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1CE783]/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#1CE783] via-purple-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
                  <img 
                    src={getPosterUrl(safeContent.poster_path)} 
                    alt={title}
                    className="w-full h-auto object-cover transform group-hover:scale-[1.03] transition-transform duration-700 relative z-0"
                    style={{ viewTransitionName: 'shared-poster' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                </div>

                {/* Quick Stats - Premium Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6 lg:mb-8">
                  <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-4 border border-gray-700 hover:border-[#1CE783]/50 transition-colors group">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-2xl font-bold font-mono tracking-tight">{voteAverage.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-white/60 uppercase tracking-wider text-center">Rating</div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-colors group">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span className="text-2xl font-bold font-mono tracking-tight">
                        {releaseDate ? releaseDate.split('-')[0] : 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-white/60 uppercase tracking-wider text-center">Year</div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Action Buttons - Hulu-style */}
                <div className="space-y-3">
                  <button
                    onMouseEnter={() => setIsHoveringPlay(true)}
                    onMouseLeave={() => setIsHoveringPlay(false)}
                    onClick={() => {
                      if (mediaType === 'tv') {
                        playEpisode(selectedSeasonNumber, 1);
                      } else {
                        navigate(`/watch/${safeContent.id}?type=movie`);
                      }
                    }}
                    className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-[#1CE783] to-[#00ED82] hover:from-[#00ED82] hover:to-[#1CE783] shadow-lg shadow-[#1CE783]/30 hover:shadow-[#1CE783]/50 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <Play className={`w-5 h-5 transition-transform duration-300 ${isHoveringPlay ? 'scale-110' : ''}`} fill="black" />
                    <span className="text-gray-900">
                      {mediaType === 'movie' ? 'Watch Now' : 'Start Watching'}
                    </span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={toggleWatchlist}
                      className={`h-12 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden ${
                        inWatchlist 
                          ? 'bg-[#1CE783]/20 border-[#1CE783]/50 text-[#1CE783]' 
                          : 'bg-gray-900/80 border-gray-700 hover:border-gray-600 hover:bg-gray-800/80'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      {inWatchlist ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="font-medium">In My Stuff</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span className="font-medium">My Stuff</span>
                        </>
                      )}
                    </button>
                    
                    {trailer && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="h-12 rounded-xl border border-gray-700 bg-gray-900/80 hover:bg-gray-800/80 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <Youtube className="w-4 h-4" />
                        <span className="font-medium">Trailer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area - Enhanced Typography */}
            <div className="lg:w-2/3 xl:w-3/4">
              {/* Title & Meta with Premium Styling */}
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-[#1CE783]/10 to-purple-500/10 rounded-full text-xs font-semibold text-[#1CE783] border border-[#1CE783]/30 backdrop-blur-sm">
                    {mediaType === 'movie' ? 'MOVIE' : 'SERIES'}
                  </span>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-[#1CE783] rounded-full" />
                      <span>{safeContent.status}</span>
                    </div>
                    <span className="text-white/40">•</span>
                    <span className="uppercase tracking-wide">{safeContent.original_language}</span>
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight leading-[1.1] bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  {title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700">
                    <Clock className="w-4 h-4 text-[#1CE783]" />
                    <span className="font-medium">
                      {mediaType === 'movie' 
                        ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` 
                        : `${safeContent.number_of_seasons} Season${safeContent.number_of_seasons !== 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genres.slice(0, 3).map((g: any) => (
                      <span 
                        key={g.id} 
                        className="px-3 py-1.5 bg-gray-900/50 backdrop-blur-sm rounded-lg text-sm border border-gray-700 hover:border-[#1CE783]/50 transition-colors cursor-pointer"
                      >
                        {g.name}
                      </span>
                    ))}
                    {genres.length > 3 && (
                      <span className="px-3 py-1.5 bg-gray-900/50 backdrop-blur-sm rounded-lg text-sm border border-gray-700 text-white/60">
                        +{genres.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Premium Tagline */}
                {safeContent.tagline && (
                  <div className="relative pl-5 border-l-2 border-[#1CE783] mb-6">
                    <p className="text-lg lg:text-xl italic text-white/90 font-light">
                      "{safeContent.tagline}"
                    </p>
                  </div>
                )}
              </div>

              {/* Premium Navigation Tabs */}
              <div className="mb-6 lg:mb-8">
                <div className="flex space-x-0 border-b border-gray-700">
                  {['overview', 'cast', mediaType === 'tv' ? 'episodes' : 'details', 'details']
                    .filter(tab => tab !== 'episodes' || mediaType === 'tv')
                    .map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-5 py-3 text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                          activeTab === tab
                            ? 'text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {tab === 'overview' && 'Overview'}
                        {tab === 'cast' && 'Cast & Crew'}
                        {tab === 'episodes' && 'Episodes'}
                        {tab === 'details' && 'Details'}
                        
                        {/* Active indicator */}
                        {activeTab === tab && (
                          <>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1CE783] to-purple-500" />
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1CE783] to-purple-500 blur-sm" />
                          </>
                        )}
                        
                        {/* Hover effect */}
                        <div className="absolute bottom-0 left-1/2 right-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#1CE783] to-transparent transition-all duration-300 group-hover:left-0 group-hover:right-0" />
                      </button>
                    ))}
                </div>
              </div>

              {/* Tab Content with Premium Cards */}
              <div className="mb-8 lg:mb-12">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                      <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1CE783]/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-[#1CE783]" />
                        </div>
                        Synopsis
                      </h3>
                      <p className="text-white/80 leading-relaxed text-lg font-light">
                        {safeContent.overview}
                      </p>
                    </div>

                    {/* Featured Crew - Premium Cards */}
                    {safeContent.credits?.crew && (
                      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                          </div>
                          Featured Crew
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {safeContent.credits.crew
                            .filter((person: any) => ['Director', 'Writer', 'Creator'].includes(person.job))
                            .slice(0, 3)
                            .map((person: any) => (
                              <div 
                                key={person.id} 
                                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-[#1CE783]/50 transition-colors group cursor-pointer"
                              >
                                <p className="font-semibold text-white group-hover:text-[#1CE783] transition-colors">
                                  {person.name}
                                </p>
                                <p className="text-sm text-white/60 mt-1">{person.job}</p>
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1CE783]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cast & Crew Tab */}
                {activeTab === 'cast' && safeContent.credits?.cast && (
                  <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-2xl font-semibold mb-6">Cast & Crew</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {safeContent.credits.cast.slice(0, 12).map((person: any) => (
                        <div key={person.id} className="group cursor-pointer">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 relative">
                            {person.profile_path ? (
                              <>
                                <img 
                                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                  alt={person.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <Users className="w-12 h-12 text-white/10" />
                              </div>
                            )}
                          </div>
                          <div className="px-1">
                            <p className="font-semibold text-white group-hover:text-[#1CE783] transition-colors truncate">
                              {person.name}
                            </p>
                            <p className="text-sm text-white/60 truncate">
                              {person.character}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Episodes Tab (TV Only) */}
                {activeTab === 'episodes' && mediaType === 'tv' && (
                  <div className="space-y-6">
                    {/* Season Selector */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-2xl font-semibold">Episodes</h3>
                      <div className="relative">
                        <select
                          value={selectedSeasonNumber}
                          onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                          className="appearance-none bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-xl px-5 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#1CE783] focus:border-transparent hover:border-gray-600 transition-colors cursor-pointer"
                        >
                          {safeContent.seasons.map((season: any) => (
                            <option key={season.id} value={season.season_number}>
                              {season.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
                      </div>
                    </div>

                    {/* Episodes List */}
                    {loadingSeason ? (
                      <div className="flex justify-center py-12">
                        <div className="relative">
                          <div className="w-12 h-12 border-3 border-[#1CE783]/20 rounded-full animate-spin" />
                          <div className="w-12 h-12 border-3 border-[#1CE783] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                        </div>
                      </div>
                    ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
                      <div className="space-y-4">
                        {seasonDetails.episodes.map((episode) => (
                          <div
                            key={episode.id}
                            onClick={() => playEpisode(episode.season_number, episode.episode_number)}
                            className="group bg-gray-900/60 backdrop-blur-xl hover:bg-gray-800/60 rounded-xl p-5 border border-gray-700 hover:border-[#1CE783]/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1CE783]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
                              <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#1CE783] to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#1CE783]/20">
                                  <span className="text-lg font-bold text-gray-900">{episode.episode_number}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                  <h4 className="font-semibold text-lg group-hover:text-[#1CE783] transition-colors truncate">
                                    {episode.name}
                                  </h4>
                                  <div className="flex items-center gap-4">
                                    {episode.runtime && (
                                      <span className="text-sm text-white/60 whitespace-nowrap">
                                        {episode.runtime}m
                                      </span>
                                    )}
                                    <span className="text-sm text-white/60 whitespace-nowrap">
                                      {episode.air_date || 'TBA'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-white/70 line-clamp-2 mb-3">
                                  {episode.overview || 'No description available.'}
                                </p>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-medium">
                                      {episode.vote_average?.toFixed(1) || 'N/A'}
                                    </span>
                                  </div>
                                  <button className="text-sm text-[#1CE783] hover:text-white transition-colors font-medium">
                                    Watch Episode →
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white/60 bg-gray-900/60 rounded-2xl border border-gray-700">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-white/20" />
                        <p className="text-lg">No episodes available for this season.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Production Companies */}
                      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-400" />
                          </div>
                          Production Companies
                        </h4>
                        <div className="space-y-4">
                          {safeContent.production_companies?.map((company: any) => (
                            <div key={company.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                              {company.logo_path ? (
                                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center p-2">
                                  <img 
                                    src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                    alt={company.name}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                                  <Film className="w-6 h-6 text-white/30" />
                                </div>
                              )}
                              <span className="font-medium">{company.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                        <h4 className="text-xl font-semibold mb-4">Spoken Languages</h4>
                        <div className="flex flex-wrap gap-3">
                          {safeContent.spoken_languages?.map((lang: any) => (
                            <span 
                              key={lang.iso_639_1} 
                              className="px-4 py-2 bg-gray-800/50 rounded-lg text-sm border border-gray-700 hover:border-[#1CE783]/50 transition-colors"
                            >
                              {lang.english_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Financial Info */}
                      {(safeContent.budget > 0 || safeContent.revenue > 0) && (
                        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                          <h4 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                              <Award className="w-5 h-5 text-green-400" />
                            </div>
                            Financial Information
                          </h4>
                          <div className="space-y-4">
                            {safeContent.budget > 0 && (
                              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50">
                                <span className="text-white/70">Budget</span>
                                <span className="font-semibold text-lg">
                                  ${(safeContent.budget / 1000000).toFixed(1)}M
                                </span>
                              </div>
                            )}
                            {safeContent.revenue > 0 && (
                              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50">
                                <span className="text-white/70">Revenue</span>
                                <span className="font-semibold text-lg text-[#1CE783]">
                                  ${(safeContent.revenue / 1000000).toFixed(1)}M
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status & Links */}
                      <div className="space-y-6">
                        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                          <h4 className="text-xl font-semibold mb-4">Status</h4>
                          <div className="inline-flex items-center gap-3 px-5 py-3 bg-gray-800/50 rounded-xl border border-gray-700">
                            <div className={`w-3 h-3 rounded-full ${
                              safeContent.status === 'Released' ? 'bg-[#1CE783]' :
                              safeContent.status === 'In Production' ? 'bg-yellow-500' :
                              safeContent.status === 'Post Production' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`} />
                            <span className="font-semibold">{safeContent.status}</span>
                          </div>
                        </div>

                        {safeContent.homepage && (
                          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                            <h4 className="text-xl font-semibold mb-4">Official Links</h4>
                            <a 
                              href={safeContent.homepage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-[#1CE783] hover:from-gray-700 hover:to-gray-800 transition-all group"
                            >
                              <Globe className="w-5 h-5 text-[#1CE783]" />
                              <span className="font-medium">Visit Official Website</span>
                              <div className="ml-2 transform group-hover:translate-x-1 transition-transform">
                                →
                              </div>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section - Premium Carousel */}
        {recommendations.length > 0 && (
          <div className="border-t border-gray-700 mt-8 lg:mt-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">More Like This</h2>
                <p className="text-white/60">Discover similar content you might enjoy</p>
              </div>
              <Row 
                title="" 
                items={recommendations} 
                onItemSelect={(rec) => navigate(`/details/${mediaType}/${rec.id}`, { state: { movie: rec } })} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
