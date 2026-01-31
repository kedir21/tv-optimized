import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { MovieDetails, TvDetails, SeasonDetails, ContentItem } from '../types';
import TvButton from '../components/TvButton';
import Row from '../components/Row';
import { 
  Play, Plus, Check, Star, Calendar, Clock, Layers, Tv, 
  ChevronDown, ChevronRight, X, Youtube, Users, Globe, Award, Film, 
  BookOpen, Sparkles, Share2, Heart, AlertCircle, ExternalLink, 
  Volume2, VolumeX, Cast
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'episodes' | 'details'>('overview');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [muted, setMuted] = useState(true);
  
  const mediaType = (type as 'movie' | 'tv') || 'movie';
  
  const { scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const y = useTransform(scrollY, [0, 300], [0, -100]);

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
  }, [selectedSeasonNumber, content?.id, mediaType]);

  const handleWatchlistToggle = async () => {
    if (!content) return;
    
    try {
      await watchlistService.toggleWatchlist(content as any);
      setInWatchlist(prev => !prev);
      setNotification({
        message: inWatchlist ? 'Removed from Watchlist' : 'Added to Watchlist',
        type: 'success'
      });
    } catch (err) {
      setNotification({message: 'Failed to update watchlist', type: 'error'});
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
    } catch (err) {
      setNotification({message: 'Failed to update favorites', type: 'error'});
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
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        <div className="h-screen flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-[#00C2FF]/20 rounded-full animate-spin" />
            <div className="w-24 h-24 border-4 border-[#00C2FF] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            <div className="absolute -inset-4 bg-gradient-to-r from-[#00C2FF]/10 to-transparent blur-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white overflow-x-hidden">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[200]"
          >
            <div className={`px-6 py-4 rounded-xl backdrop-blur-xl border ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50' 
                : 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border-red-700/50'
            }`}>
              <p className="font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Parallax */}
      <div className="relative h-[80vh] sm:h-[90vh] overflow-hidden">
        {/* Backdrop Image with Parallax */}
        <motion.div 
          style={{ scale, y }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black/20 z-10" />
          <img
            src={getImageUrl(safeContent.backdrop_path, 'original')}
            alt={title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Glassmorphism Header */}
        <motion.header 
          style={{ opacity }}
          className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-black/30 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-black/30 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-black/30 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all">
                <Cast className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-end px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-3 gap-8 items-end">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#00C2FF] via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  <img
                    src={getPosterUrl(safeContent.poster_path)}
                    alt={title}
                    className="relative rounded-2xl shadow-2xl w-full max-w-sm mx-auto lg:mx-0"
                  />
                </div>
              </motion.div>

              {/* Title & Actions */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <div className="space-y-6">
                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g: any) => (
                      <span
                        key={g.id}
                        className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm border border-white/20"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    {title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-bold">{voteAverage.toFixed(1)}</span>
                    </div>
                    <span className="text-white/40">•</span>
                    <span>{releaseDate?.split('-')[0]}</span>
                    <span className="text-white/40">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {mediaType === 'movie'
                          ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
                          : `${safeContent.number_of_seasons} Season${safeContent.number_of_seasons !== 1 ? 's' : ''}`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Tagline */}
                  {safeContent.tagline && (
                    <p className="text-xl text-white/70 italic">"{safeContent.tagline}"</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => navigate(`/watch/${safeContent.id}?type=${mediaType}`)}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00C2FF] to-[#0085FF] hover:from-[#0085FF] hover:to-[#00C2FF] font-bold text-lg flex items-center gap-3 group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00C2FF]/30"
                    >
                      <Play className="w-6 h-6" fill="white" />
                      <span>{mediaType === 'movie' ? 'Watch Now' : 'Start Watching'}</span>
                    </button>

                    {trailer && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 font-medium flex items-center gap-3 group transition-all"
                      >
                        <Youtube className="w-5 h-5" />
                        <span>Trailer</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleWatchlistToggle}
                        className={`p-3 rounded-xl border transition-all ${
                          inWatchlist
                            ? 'bg-[#00C2FF]/20 border-[#00C2FF]/50 text-[#00C2FF]'
                            : 'bg-white/10 border-white/20 hover:bg-white/20'
                        }`}
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
                      >
                        <Heart className={`w-5 h-5 ${inFavorites ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="sticky top-0 z-40 pt-8 pb-4 bg-gradient-to-b from-black via-black to-transparent">
            <div className="flex space-x-8 border-b border-white/10">
              {['overview', 'cast', mediaType === 'tv' ? 'episodes' : 'details', 'details']
                .filter(tab => tab !== 'episodes' || mediaType === 'tv')
                .map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 text-sm font-medium transition-all relative ${
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
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00C2FF] to-purple-500"
                      />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Synopsis */}
                  <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <h3 className="text-2xl font-bold mb-4">Synopsis</h3>
                    <p className="text-white/80 leading-relaxed text-lg">
                      {safeContent.overview}
                    </p>
                  </div>

                  {/* Featured Crew */}
                  {safeContent.credits?.crew && (
                    <div>
                      <h3 className="text-2xl font-bold mb-6">Featured Crew</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {safeContent.credits.crew
                          .filter((person: any) => ['Director', 'Writer', 'Creator'].includes(person.job))
                          .slice(0, 6)
                          .map((person: any) => (
                            <div
                              key={person.id}
                              className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group cursor-pointer"
                            >
                              <p className="font-bold text-lg group-hover:text-[#00C2FF] transition-colors">
                                {person.name}
                              </p>
                              <p className="text-white/60 mt-1">{person.job}</p>
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
                >
                  <h3 className="text-2xl font-bold mb-6">Cast</h3>
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
                        <div>
                          <p className="font-bold truncate group-hover:text-[#00C2FF] transition-colors">
                            {person.name}
                          </p>
                          <p className="text-white/60 text-sm truncate">
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
                  className="space-y-8"
                >
                  {/* Season Selector */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">Episodes</h3>
                    <select
                      value={selectedSeasonNumber}
                      onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    >
                      {safeContent.seasons.map((season: any) => (
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
                        <div className="w-12 h-12 border-3 border-[#00C2FF]/20 rounded-full animate-spin" />
                        <div className="w-12 h-12 border-3 border-[#00C2FF] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {seasonDetails?.episodes?.map((episode) => (
                        <div
                          key={episode.id}
                          className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="w-20 h-20 bg-gradient-to-br from-[#00C2FF] to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl font-bold">{episode.episode_number}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                <h4 className="font-bold text-lg group-hover:text-[#00C2FF] transition-colors">
                                  {episode.name}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-white/60">
                                  {episode.runtime && <span>{episode.runtime}m</span>}
                                  <span>{episode.air_date || 'TBA'}</span>
                                </div>
                              </div>
                              <p className="text-white/70 line-clamp-2 mb-3">
                                {episode.overview || 'No description available.'}
                              </p>
                              <div className="flex items-center gap-4">
                                {episode.vote_average && (
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span>{episode.vote_average.toFixed(1)}</span>
                                  </div>
                                )}
                                <button className="text-[#00C2FF] hover:text-white transition-colors font-medium">
                                  Watch Episode →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
                  className="grid lg:grid-cols-2 gap-8"
                >
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Production */}
                    <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                      <h4 className="text-xl font-bold mb-6">Production</h4>
                      <div className="space-y-4">
                        {safeContent.production_companies?.map((company: any) => (
                          <div key={company.id} className="flex items-center gap-4">
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
                    <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                      <h4 className="text-xl font-bold mb-4">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {safeContent.spoken_languages?.map((lang: any) => (
                          <span
                            key={lang.iso_639_1}
                            className="px-3 py-1.5 bg-white/10 rounded-lg text-sm"
                          >
                            {lang.english_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Financial Info */}
                    {(safeContent.budget > 0 || safeContent.revenue > 0) && (
                      <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h4 className="text-xl font-bold mb-6">Financial Info</h4>
                        <div className="space-y-4">
                          {safeContent.budget > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-white/70">Budget</span>
                              <span className="font-bold">
                                ${(safeContent.budget / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          )}
                          {safeContent.revenue > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-white/70">Revenue</span>
                              <span className="font-bold text-[#00C2FF]">
                                ${(safeContent.revenue / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                      <h4 className="text-xl font-bold mb-4">Status</h4>
                      <div className="inline-flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          safeContent.status === 'Released' ? 'bg-green-500' :
                          safeContent.status === 'In Production' ? 'bg-yellow-500' :
                          safeContent.status === 'Post Production' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="font-medium">{safeContent.status}</span>
                      </div>
                    </div>

                    {/* Homepage Link */}
                    {safeContent.homepage && (
                      <a
                        href={safeContent.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all group"
                      >
                        <Globe className="w-5 h-5" />
                        <span className="font-medium">Official Website</span>
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
            <div className="mt-16 pt-8 border-t border-white/10">
              <h3 className="text-2xl font-bold mb-6">More Like This</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recommendations.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/details/${item.media_type || mediaType}/${item.id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative">
                      <img
                        src={getPosterUrl(item.poster_path)}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-[#00C2FF] to-purple-500 font-medium text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                    <p className="font-medium truncate group-hover:text-[#00C2FF] transition-colors">
                      {item.title || item.name}
                    </p>
                  </div>
                ))}
              </div>
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
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="aspect-video rounded-2xl overflow-hidden bg-black">
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
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    Watch Full Movie
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Details;
