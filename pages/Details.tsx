import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { MovieDetails, TvDetails, SeasonDetails, ContentItem } from '../types';
import Row from '../components/Row';
import { 
  Play, Plus, Check, Star, Calendar, Clock, X, Youtube, Users, Globe, 
  Award, Film, Share2, Heart, AlertCircle, ExternalLink, Volume2, VolumeX,
  ChevronLeft, ChevronRight, Info, TrendingUp, Languages, Building2
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const initialData = location.state?.movie as ContentItem | undefined;
  const [content, setContent] = useState<MovieDetails | TvDetails | null>(initialData || null);
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'episodes' | 'details'>('overview');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [muted, setMuted] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  
  const mediaType = (type as 'movie' | 'tv') || 'movie';
  
  const { scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const headerOpacity = useTransform(scrollY, [0, 200], [0, 1]);
  const backdropOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const backdropScale = useTransform(scrollY, [0, 400], [1, 1.1]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      if (!initialData) setLoading(true);
      
      try {
        const [data, recs] = await Promise.all([
          api.getDetails(id, mediaType),
          api.getRecommendations(parseInt(id), mediaType)
        ]);
        
        (data as any).media_type = mediaType;
        setContent(data);
        setRecommendations(recs);

        const [inList, isFav] = await Promise.all([
          watchlistService.isInWatchlist(data.id),
          watchlistService.isFavorite(data.id)
        ]);
        
        setInWatchlist(inList);
        setInFavorites(isFav);

        if (mediaType === 'tv' && 'seasons' in data && data.seasons?.length) {
          const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
          setSelectedSeasonNumber(firstSeason.season_number);
        }
      } catch (err) {
        console.error(err);
        setNotification({message: 'Failed to load content', type: 'error'});
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id, mediaType]);

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
  }, [selectedSeasonNumber, content?.id, mediaType, id]);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setHeaderScrolled(latest > 100);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const handleWatchlistToggle = async () => {
    if (!content) return;
    
    try {
      await watchlistService.toggleWatchlist(content as any);
      setInWatchlist(prev => !prev);
      setNotification({
        message: inWatchlist ? 'Removed from Watchlist' : 'Added to Watchlist',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({message: 'Failed to update watchlist', type: 'error'});
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!content) return;
    
    try {
      await watchlistService.toggleFavorite(content as any);
      setInFavorites(prev => !prev);
      setNotification({
        message: inFavorites ? 'Removed from Favorites' : 'Added to Favorites',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({message: 'Failed to update favorites', type: 'error'});
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content?.title || content?.name,
          text: `Check out ${content?.title || content?.name} on our streaming service!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setNotification({message: 'Link copied to clipboard', type: 'success'});
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const safeContent = content || {} as any;
  const title = 'title' in safeContent ? safeContent.title : safeContent.name;
  const releaseDate = 'release_date' in safeContent ? safeContent.release_date : safeContent.first_air_date;
  const runtime = 'runtime' in safeContent ? safeContent.runtime : (safeContent.episode_run_time?.[0] || 0);
  const voteAverage = safeContent.vote_average || 0;
  const genres = safeContent.genres || [];
  const trailer = safeContent.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full animate-spin" />
          <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white overflow-x-hidden">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-4 sm:right-6 z-[200] max-w-sm"
          >
            <div className={`px-4 py-3 rounded-xl backdrop-blur-xl border shadow-2xl ${
              notification.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' 
                : 'bg-red-500/20 border-red-500/50 text-red-100'
            }`}>
              <p className="font-medium text-sm">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          headerScrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-sm"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-sm"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden">
        {/* Backdrop Image */}
        <motion.div 
          style={{ opacity: backdropOpacity, scale: backdropScale }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
          <img
            src={getImageUrl(safeContent.backdrop_path)}
            alt={title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-end">
              {/* Poster - Mobile: Centered, Desktop: Left */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="lg:col-span-3 flex justify-center lg:justify-start"
              >
                <div className="relative group w-full max-w-[280px]">
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  <img
                    src={getPosterUrl(safeContent.poster_path)}
                    alt={title}
                    className="relative rounded-2xl shadow-2xl w-full aspect-[2/3] object-cover"
                  />
                </div>
              </motion.div>

              {/* Title & Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="lg:col-span-9 space-y-4 sm:space-y-6"
              >
                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {genres.slice(0, 4).map((g: any) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs sm:text-sm border border-white/20 font-medium"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                  {title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{voteAverage.toFixed(1)}</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span>{releaseDate?.split('-')[0] || 'N/A'}</span>
                  <span className="text-white/40">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>
                      {mediaType === 'movie'
                        ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
                        : `${safeContent.number_of_seasons || 0} Season${(safeContent.number_of_seasons || 0) !== 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                </div>

                {/* Tagline */}
                {safeContent.tagline && (
                  <p className="text-base sm:text-lg lg:text-xl text-white/80 italic max-w-3xl">
                    "{safeContent.tagline}"
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <button
                    onClick={() => navigate(`/watch/${safeContent.id}?type=${mediaType}`)}
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-base sm:text-lg flex items-center gap-2 sm:gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30"
                  >
                    <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="white" />
                    <span>{mediaType === 'movie' ? 'Watch Now' : 'Start Watching'}</span>
                  </button>

                  {trailer && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="px-5 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 font-medium flex items-center gap-2 sm:gap-3 transition-all"
                    >
                      <Youtube className="w-5 h-5" />
                      <span className="hidden sm:inline">Trailer</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleWatchlistToggle}
                      className={`p-3 rounded-xl border transition-all ${
                        inWatchlist
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                      aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={handleFavoriteToggle}
                      className={`p-3 rounded-xl border transition-all ${
                        inFavorites
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                      aria-label={inFavorites ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-5 h-5 ${inFavorites ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 -mt-12 sm:-mt-16 lg:-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="sticky top-0 z-40 pt-4 sm:pt-6 pb-4 bg-gradient-to-b from-black via-black/95 to-transparent backdrop-blur-sm">
            <div className="flex space-x-1 sm:space-x-4 md:space-x-8 border-b border-white/10 overflow-x-auto scrollbar-hide">
              {['overview', 'cast', mediaType === 'tv' ? 'episodes' : null, 'details']
                .filter(Boolean)
                .map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 sm:pb-4 text-sm sm:text-base font-medium transition-all relative whitespace-nowrap px-2 sm:px-0 ${
                      activeTab === tab ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {tab === 'overview' && 'Overview'}
                    {tab === 'cast' && 'Cast & Crew'}
                    {tab === 'episodes' && 'Episodes'}
                    {tab === 'details' && 'Details'}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                      />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="py-6 sm:py-8 lg:py-12">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Synopsis */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      Synopsis
                    </h3>
                    <p className="text-white/80 leading-relaxed text-base sm:text-lg">
                      {safeContent.overview || 'No overview available.'}
                    </p>
                  </div>

                  {/* Featured Crew */}
                  {safeContent.credits?.crew && safeContent.credits.crew.length > 0 && (
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                        Featured Crew
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {safeContent.credits.crew
                          .filter((person: any) => ['Director', 'Writer', 'Creator', 'Producer'].includes(person.job))
                          .slice(0, 6)
                          .map((person: any) => (
                            <div
                              key={person.id}
                              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:border-cyan-500/50 transition-all group cursor-pointer"
                            >
                              <p className="font-bold text-base sm:text-lg group-hover:text-cyan-400 transition-colors">
                                {person.name}
                              </p>
                              <p className="text-white/60 text-sm mt-1">{person.job}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Cast Tab */}
              {activeTab === 'cast' && safeContent.credits?.cast && (
                <motion.div
                  key="cast"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                    Cast & Crew
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
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
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                              <Users className="w-8 h-8 sm:w-12 sm:h-12 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base truncate group-hover:text-cyan-400 transition-colors">
                            {person.name}
                          </p>
                          <p className="text-white/60 text-xs sm:text-sm truncate">
                            {person.character}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Episodes Tab (TV Only) */}
              {activeTab === 'episodes' && mediaType === 'tv' && (
                <motion.div
                  key="episodes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Season Selector */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-xl sm:text-2xl font-bold">Episodes</h3>
                    <select
                      value={selectedSeasonNumber}
                      onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm sm:text-base w-full sm:w-auto"
                    >
                      {safeContent.seasons?.map((season: any) => (
                        <option key={season.id} value={season.season_number}>
                          {season.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Episodes List */}
                  {loadingSeason ? (
                    <div className="flex justify-center py-12">
                      <div className="relative">
                        <div className="w-12 h-12 border-3 border-cyan-500/20 rounded-full animate-spin" />
                        <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                      </div>
                    </div>
                  ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
                    <div className="space-y-4">
                      {seasonDetails.episodes.map((episode) => (
                        <div
                          key={episode.id}
                          onClick={() => navigate(`/watch/${safeContent.id}?type=tv&s=${episode.season_number}&e=${episode.episode_number}`)}
                          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="relative flex-shrink-0 w-full sm:w-auto">
                              {episode.still_path ? (
                                <div className="aspect-video sm:w-40 rounded-lg overflow-hidden">
                                  <img
                                    src={getStillUrl(episode.still_path)}
                                    alt={episode.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              ) : (
                                <div className="w-full sm:w-40 aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                                  <Film className="w-8 h-8 text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-cyan-400 font-bold text-lg sm:text-xl">{episode.episode_number}</span>
                                  <h4 className="font-bold text-base sm:text-lg group-hover:text-cyan-400 transition-colors truncate">
                                    {episode.name}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/60">
                                  {episode.runtime && <span>{episode.runtime}m</span>}
                                  <span>{episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'TBA'}</span>
                                </div>
                              </div>
                              <p className="text-white/70 line-clamp-2 sm:line-clamp-3 mb-3 text-sm sm:text-base">
                                {episode.overview || 'No description available.'}
                              </p>
                              <div className="flex items-center gap-4">
                                {episode.vote_average > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium">{episode.vote_average.toFixed(1)}</span>
                                  </div>
                                )}
                                <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-sm sm:text-base flex items-center gap-1">
                                  Watch Episode <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/60 bg-white/5 rounded-2xl border border-white/10">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-white/20" />
                      <p className="text-lg">No episodes available for this season.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid lg:grid-cols-2 gap-6 sm:gap-8"
                >
                  {/* Left Column */}
                  <div className="space-y-6 sm:space-y-8">
                    {/* Production Companies */}
                    {safeContent.production_companies && safeContent.production_companies.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-cyan-400" />
                          Production Companies
                        </h4>
                        <div className="space-y-4">
                          {safeContent.production_companies.map((company: any) => (
                            <div key={company.id} className="flex items-center gap-4">
                              {company.logo_path ? (
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-lg flex items-center justify-center p-2">
                                  <img
                                    src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                    alt={company.name}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                                  <Film className="w-6 h-6 sm:w-8 sm:h-8 text-white/30" />
                                </div>
                              )}
                              <span className="font-medium text-sm sm:text-base">{company.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {safeContent.spoken_languages && safeContent.spoken_languages.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h4 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                          <Languages className="w-5 h-5 text-cyan-400" />
                          Spoken Languages
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {safeContent.spoken_languages.map((lang: any) => (
                            <span
                              key={lang.iso_639_1}
                              className="px-3 py-1.5 bg-white/10 rounded-lg text-sm border border-white/20"
                            >
                              {lang.english_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6 sm:space-y-8">
                    {/* Financial Info */}
                    {(safeContent.budget > 0 || safeContent.revenue > 0) && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                        <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-cyan-400" />
                          Financial Information
                        </h4>
                        <div className="space-y-4">
                          {safeContent.budget > 0 && (
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                              <span className="text-white/70 text-sm sm:text-base">Budget</span>
                              <span className="font-bold text-base sm:text-lg">
                                ${(safeContent.budget / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          )}
                          {safeContent.revenue > 0 && (
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                              <span className="text-white/70 text-sm sm:text-base">Revenue</span>
                              <span className="font-bold text-base sm:text-lg text-cyan-400">
                                ${(safeContent.revenue / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                      <h4 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-cyan-400" />
                        Status
                      </h4>
                      <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-lg border border-white/10">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          safeContent.status === 'Released' ? 'bg-green-500' :
                          safeContent.status === 'In Production' ? 'bg-yellow-500' :
                          safeContent.status === 'Post Production' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="font-medium text-sm sm:text-base">{safeContent.status || 'Unknown'}</span>
                      </div>
                    </div>

                    {/* Homepage Link */}
                    {safeContent.homepage && (
                      <a
                        href={safeContent.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all group w-full sm:w-auto"
                      >
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <span className="font-medium text-sm sm:text-base">Official Website</span>
                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-white/10">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">More Like This</h3>
              <Row 
                title="" 
                items={recommendations} 
                onItemSelect={(rec) => navigate(`/details/${rec.media_type || mediaType}/${rec.id}`, { state: { movie: rec } })} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Close trailer"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/20">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0&controls=1&showinfo=0${muted ? '&mute=1' : ''}`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={`${title} Trailer`}
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Details;
