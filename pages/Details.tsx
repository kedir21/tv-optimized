import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Play, Plus, Check, Star, Clock, X, Youtube, 
  Users, Film, Share2, Calendar, Globe, Award, 
  Languages, Building2, Info, AlertCircle, ExternalLink,
  Volume2, VolumeX, ArrowLeft, Bookmark, ChevronDown,
  Heart, Maximize2, MoreVertical, Sparkles
} from 'lucide-react';
import { api, getImageUrl, getPosterUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { MovieDetails, TvDetails, SeasonDetails, ContentItem } from '../types';
import Row from '../components/Row';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const initialData = location.state?.movie as ContentItem | undefined;
  const [content, setContent] = useState<MovieDetails | TvDetails | null>(null);
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [muted, setMuted] = useState(true);
  const [expandedOverview, setExpandedOverview] = useState(false);
  
  const mediaType = (type as 'movie' | 'tv') || 'movie';
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.2]);
  const y = useTransform(scrollY, [0, 300], [0, 100]);

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
        setContent(data as MovieDetails | TvDetails);
        setRecommendations(recs);

        const inList = await watchlistService.isInWatchlist(data.id);
        setInWatchlist(inList);

        if (mediaType === 'tv' && 'seasons' in data && data.seasons?.length) {
          const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
          setSelectedSeasonNumber(firstSeason.season_number);
        }
      } catch (err) {
        console.error(err);
        setNotification({message: 'Failed to load content', type: 'error'});
        setTimeout(() => setNotification(null), 4000);
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
      
      try {
        const data = await api.getSeasonDetails(parseInt(id), selectedSeasonNumber);
        setSeasonDetails(data);
      } catch (e) {
        console.error("Failed to load season", e);
      }
    };

    fetchSeason();
  }, [selectedSeasonNumber, content?.id, mediaType, id]);

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

  const handleShare = async () => {
    const shareTitle = 'title' in safeContent ? safeContent.title : ('name' in safeContent ? safeContent.name : '');
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Check out ${shareTitle}!`,
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
  const title = 'title' in safeContent ? safeContent.title : ('name' in safeContent ? safeContent.name : '');
  const releaseDate = 'release_date' in safeContent ? safeContent.release_date : safeContent.first_air_date;
  const voteAverage = safeContent.vote_average || 0;
  const genres = safeContent.genres || [];
  const trailer = safeContent.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-white/10 rounded-full animate-spin" />
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className={`px-4 py-3 rounded-lg backdrop-blur-md border ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                : 'bg-red-500/10 border-red-500/30 text-red-200'
            }`}>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative h-[90vh] overflow-hidden">
        <motion.div 
          style={{ opacity, scale, y }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent z-10" />
          <img
            src={getImageUrl(safeContent.backdrop_path)}
            alt={title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black z-20" />

        {/* Content */}
        <div className="relative z-30 h-full flex items-end pb-20">
          <div className="max-w-7xl mx-auto w-full px-6">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid lg:grid-cols-12 gap-8 items-end"
            >
              {/* Poster */}
              <div className="lg:col-span-4">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-3xl blur-3xl opacity-0 group-hover:opacity-50 transition-opacity" />
                  <img
                    src={getPosterUrl(safeContent.poster_path)}
                    alt={title}
                    className="relative rounded-2xl shadow-2xl w-full aspect-[2/3] object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-8 space-y-6">
                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-black leading-[0.9]">
                  {title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-lg">{voteAverage.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar className="w-4 h-4" />
                    <span>{releaseDate?.split('-')[0] || 'N/A'}</span>
                  </div>
                  {mediaType === 'movie' ? (
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="w-4 h-4" />
                      <span>{safeContent.runtime}m</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-white/70">
                      <span>{safeContent.number_of_seasons} Seasons</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {genres.slice(0, 3).map((g: any) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 rounded-full bg-white/5 text-sm border border-white/10"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/watch/${safeContent.id}?type=${mediaType}`)}
                    className="px-8 py-4 rounded-xl bg-white hover:bg-white/90 text-black font-bold flex items-center gap-3 transition-all"
                  >
                    <Play className="w-6 h-6" fill="currentColor" />
                    <span>Play</span>
                  </motion.button>

                  {trailer && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                    >
                      <Youtube className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={handleWatchlistToggle}
                    className={`p-4 rounded-xl border transition-all ${
                      inWatchlist
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {inWatchlist ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-40">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-6 h-6 text-cyan-400" />
                <h3 className="text-2xl font-bold">Overview</h3>
              </div>
              <div className={`relative ${!expandedOverview && 'max-h-48 overflow-hidden'}`}>
                <p className="text-white/80 leading-relaxed text-lg">
                  {safeContent.overview || 'No overview available.'}
                </p>
                {safeContent.overview?.length > 300 && (
                  <button
                    onClick={() => setExpandedOverview(!expandedOverview)}
                    className="absolute bottom-0 right-0 text-cyan-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1"
                  >
                    {expandedOverview ? 'Show less' : 'Read more'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedOverview ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Cast */}
            {safeContent.credits?.cast && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-purple-400" />
                  <h3 className="text-2xl font-bold">Cast</h3>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {safeContent.credits.cast.slice(0, 10).map((person: any) => (
                    <div key={person.id} className="group cursor-pointer">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-white/5">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-white/30" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm truncate">{person.name}</p>
                      <p className="text-white/60 text-xs truncate">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seasons (TV Only) */}
            {mediaType === 'tv' && seasonDetails?.episodes && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Film className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-bold">Episodes</h3>
                  </div>
                  <select
                    value={selectedSeasonNumber}
                    onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                    className="bg-slate-900/90 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all cursor-pointer"
                    style={{ backgroundColor: '#0f172a' }}
                  >
                    {safeContent.seasons?.map((season: any) => (
                      <option key={season.id} value={season.season_number} style={{ backgroundColor: '#0f172a' }}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  {seasonDetails.episodes.map((episode) => (
                    <div
                      key={episode.id}
                      onClick={() => navigate(`/watch/${safeContent.id}?type=tv&s=${episode.season_number}&e=${episode.episode_number}`)}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="relative flex-shrink-0 w-32">
                        {episode.still_path ? (
                          <img
                            src={getStillUrl(episode.still_path)}
                            alt={episode.name}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                            <Film className="w-8 h-8 text-white/30" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs font-bold">
                          Ep {episode.episode_number}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold group-hover:text-cyan-400 transition-colors truncate">
                            {episode.name}
                          </h4>
                          <span className="text-sm text-white/60">{episode.runtime}m</span>
                        </div>
                        <p className="text-white/70 text-sm line-clamp-2">
                          {episode.overview || 'No description available.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Crew */}
            {safeContent.credits?.crew && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-xl font-bold">Top Crew</h4>
                </div>
                <div className="space-y-4">
                  {safeContent.credits.crew
                    .filter((person: any) => ['Director', 'Writer', 'Creator'].includes(person.job))
                    .slice(0, 4)
                    .map((person: any) => (
                      <div key={person.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{person.name}</p>
                          <p className="text-white/60 text-sm">{person.job}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h4 className="text-xl font-bold">Details</h4>
              </div>

              {/* Status */}
              <div>
                <p className="text-white/60 text-sm mb-2">Status</p>
                <p className="font-semibold">{safeContent.status || 'Unknown'}</p>
              </div>

              {/* Languages */}
              {safeContent.spoken_languages && (
                <div>
                  <p className="text-white/60 text-sm mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {safeContent.spoken_languages.slice(0, 3).map((lang: any) => (
                      <span key={lang.iso_639_1} className="px-2 py-1 bg-white/5 rounded text-sm">
                        {lang.english_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget */}
              {safeContent.budget > 0 && (
                <div>
                  <p className="text-white/60 text-sm mb-2">Budget</p>
                  <p className="font-semibold">${(safeContent.budget / 1000000).toFixed(1)}M</p>
                </div>
              )}

              {/* Homepage */}
              {safeContent.homepage && (
                <a
                  href={safeContent.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Production Companies */}
            {safeContent.production_companies && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h4 className="text-xl font-bold">Production</h4>
                </div>
                <div className="space-y-4">
                  {safeContent.production_companies.slice(0, 3).map((company: any) => (
                    <div key={company.id} className="flex items-center gap-3">
                      {company.logo_path ? (
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center p-1">
                          <img
                            src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                            alt={company.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white/30" />
                        </div>
                      )}
                      <span className="text-sm font-medium">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16 pt-12 border-t border-white/10">
            <h3 className="text-2xl font-bold mb-8">More Like This</h3>
            <Row 
              title="" 
              items={recommendations} 
              onItemSelect={(rec) => navigate(`/details/${rec.media_type || mediaType}/${rec.id}`, { state: { movie: rec } })} 
            />
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0${muted ? '&mute=1' : ''}`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={`${title} Trailer`}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Details;