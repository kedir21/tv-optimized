
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Users, Film, Star, Clock, Info,
  ArrowUp, ChevronDown, Building2, Globe,
  ExternalLink, Award, Sparkles, MessageSquare,
  LayoutGrid, Play
} from 'lucide-react';
import { api, getImageUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { MovieDetails, TvDetails, SeasonDetails, ContentItem, Review } from '../types';
import Row from '../components/Row';
import { Hero } from '../components/Details/Hero';
import { Tabs } from '../components/Details/Tabs';
import { ReviewCard } from '../components/Details/ReviewCard';
import { DetailsSkeleton } from '../components/Skeletons';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'cast', label: 'Cast & Crew' },
  { id: 'episodes', label: 'Episodes' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'similar', label: 'Similar' }
];

import Meta from '../components/Meta';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initialData = location.state?.movie as ContentItem | undefined;
  const [content, setContent] = useState<MovieDetails | TvDetails | null>(null);
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedOverview, setExpandedOverview] = useState(false);

  const mediaType = (type as 'movie' | 'tv') || 'movie';

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      if (!initialData) setLoading(true);

      try {
        const [data, recs, reviewData] = await Promise.all([
          api.getDetails(id, mediaType),
          api.getRecommendations(parseInt(id), mediaType),
          api.getReviews(parseInt(id), mediaType)
        ]);

        (data as any).media_type = mediaType;
        setContent(data as MovieDetails | TvDetails);
        setRecommendations(recs);
        setReviews(reviewData);

        const inList = await watchlistService.isInWatchlist(data.id);
        setInWatchlist(inList);

        if (mediaType === 'tv' && 'seasons' in data && data.seasons?.length) {
          const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
          setSelectedSeasonNumber(firstSeason.season_number);
        }
      } catch (err) {
        console.error(err);
        setNotification({ message: 'Failed to load content', type: 'error' });
        setTimeout(() => setNotification(null), 4000);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setNotification({ message: 'Failed to update watchlist', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleShare = async () => {
    const title = content ? ('title' in content ? content.title : content.name) : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out ${title} on KK-flix!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setNotification({ message: 'Link copied to clipboard', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || !content) {
    return <DetailsSkeleton />;
  }

  const trailer = content.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
  const director = content.credits?.crew?.find(c => c.job === 'Director')?.name;
  const writers = content.credits?.crew?.filter(c => ['Writer', 'Screenplay', 'Author'].includes(c.job)).map(c => c.name).slice(0, 3).join(', ');
  const creators = (content as TvDetails).credits?.crew?.filter(c => c.job === 'Creator').map(c => c.name).slice(0, 3).join(', ');

  const filteredTabs = TABS.filter(tab => {
    if (tab.id === 'episodes' && mediaType !== 'tv') return false;
    if (tab.id === 'reviews' && reviews.length === 0) return false;
    return true;
  });

  const contentTitle = 'title' in content ? content.title : content.name;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30">
      <Meta
        title={contentTitle}
        description={content.overview?.substring(0, 160)}
        image={getImageUrl(content.backdrop_path)}
        type={mediaType === 'movie' ? 'video.movie' : 'video.tv_show'}
      />
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[60]"
          >
            <div className={`px-4 py-3 rounded-xl backdrop-blur-xl border shadow-2xl ${notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
              }`}>
              <p className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {notification.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Hero
        content={content}
        mediaType={mediaType}
        inWatchlist={inWatchlist}
        onWatchlistToggle={handleWatchlistToggle}
        onShare={handleShare}
        onPlay={() => navigate(`/watch/${content.id}?type=${mediaType}`)}
        onTrailer={() => setShowTrailer(true)}
        hasTrailer={!!trailer}
      />

      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={filteredTabs}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                <div className="lg:col-span-2 space-y-12">
                  {/* Synopsis */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Info className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-black">Synopsis</h3>
                    </div>
                    <div className="relative">
                      <p className={`text-lg lg:text-xl text-white/70 leading-relaxed font-light ${!expandedOverview && content.overview?.length > 400 ? 'line-clamp-4' : ''}`}>
                        {content.overview || 'No synopsis available for this title.'}
                      </p>
                      {content.overview?.length > 400 && (
                        <button
                          onClick={() => setExpandedOverview(!expandedOverview)}
                          className="mt-4 text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1 group"
                        >
                          {expandedOverview ? 'View less' : 'Read full synopsis'}
                          <ChevronDown className={`w-4 h-4 transition-transform group-hover:translate-y-0.5 ${expandedOverview ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Trailer/Media Preview */}
                  {trailer && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                          <Film className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-black">Official Trailer</h3>
                      </div>
                      <div className="aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl relative group">
                        <iframe
                          src={`https://www.youtube.com/embed/${trailer.key}?modestbranding=1&rel=0`}
                          className="w-full h-full"
                          allowFullScreen
                          title="Trailer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-xl font-bold">Project Details</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {director && (
                        <div>
                          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1.5">Director</p>
                          <p className="text-lg font-medium text-white">{director}</p>
                        </div>
                      )}
                      {(writers || creators) && (
                        <div>
                          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1.5">
                            {mediaType === 'movie' ? 'Writers' : 'Creators'}
                          </p>
                          <p className="text-lg font-medium text-white">{writers || creators}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1.5">Status</p>
                        <p className="text-lg font-medium text-white">{content.status || 'Released'}</p>
                      </div>
                      {mediaType === 'movie' && (content as MovieDetails).budget > 0 && (
                        <div>
                          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1.5">Budget</p>
                          <p className="text-lg font-medium text-white">
                            ${((content as MovieDetails).budget / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1.5">Languages</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {content.spoken_languages?.slice(0, 3).map(lang => (
                            <span key={lang.iso_639_1} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold">
                              {lang.english_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {content.homepage && (
                      <a
                        href={content.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-cyan-500 text-[#020617] font-bold transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      >
                        <Globe className="w-5 h-5" />
                        <span>Official Website</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Production Companies */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-purple-400" />
                      <h4 className="text-xl font-bold">Production</h4>
                    </div>
                    <div className="space-y-4">
                      {content.production_companies?.slice(0, 4).map(company => (
                        <div key={company.id} className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-white/10 group-hover:border-white/30 transition-colors">
                            {company.logo_path ? (
                              <img src={`https://image.tmdb.org/t/p/w92${company.logo_path}`} alt={company.name} className="max-w-full max-h-full object-contain filter invert brightness-200" />
                            ) : (
                              <Building2 className="w-5 h-5 text-white/40" />
                            )}
                          </div>
                          <p className="font-bold text-white/80 group-hover:text-white transition-colors">{company.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cast' && (
              <div className="space-y-12">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black">Main Cast</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 lg:gap-8">
                  {content.credits?.cast?.slice(0, 18).map(person => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -10 }}
                      className="group flex flex-col items-center"
                    >
                      <div className="relative w-full aspect-[5/6] rounded-3xl overflow-hidden mb-4 border-2 border-transparent group-hover:border-purple-500/50 shadow-xl transition-all">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <Users className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020617] to-transparent opacity-60" />
                      </div>
                      <h4 className="font-black text-center text-white line-clamp-1 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{person.name}</h4>
                      <p className="text-sm text-white/40 text-center line-clamp-1 italic">{person.character}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-12 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-black">Featured Crew</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {content.credits?.crew?.filter(c => ['Director', 'Producer', 'Executive Producer', 'Writer', 'Director of Photography', 'Original Music Composer'].includes(c.job)).slice(0, 12).map(person => (
                      <div key={`${person.id}-${person.job}`} className="space-y-1">
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{person.job}</p>
                        <p className="text-lg font-black text-white">{person.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'episodes' && mediaType === 'tv' && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-black">Episode Guide</h3>
                  </div>
                  <div className="relative group">
                    <select
                      value={selectedSeasonNumber}
                      onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                      className="appearance-none bg-[#020617] border-2 border-white/10 rounded-2xl px-6 pr-12 py-3.5 text-white font-black text-lg focus:outline-none focus:border-cyan-500 transition-all cursor-pointer shadow-xl hover:bg-white/5 active:scale-95"
                    >
                      {content.seasons?.filter(s => s.season_number > 0).map((season) => (
                        <option key={season.id} value={season.season_number}>
                          Season {season.season_number}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {seasonDetails?.episodes.map((episode) => (
                    <motion.div
                      key={episode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -8 }}
                      onClick={() => navigate(`/watch/${content.id}?type=tv&s=${episode.season_number}&e=${episode.episode_number}`)}
                      className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col cursor-pointer transition-all hover:border-cyan-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                    >
                      <div className="relative aspect-video w-full overflow-hidden">
                        {episode.still_path ? (
                          <img
                            src={getStillUrl(episode.still_path)}
                            alt={episode.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <Film className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter">
                            Episode {episode.episode_number}
                          </div>
                          {episode.runtime && (
                            <div className="bg-cyan-500 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter text-[#020617] self-start">
                              {episode.runtime}m
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#020617] transform scale-0 group-hover:scale-100 transition-transform">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-3">
                        <h4 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight line-clamp-1">
                          {episode.name}
                        </h4>
                        <p className="text-white/40 text-sm line-clamp-2 italic font-light">
                          {episode.overview || 'No plot summary available for this episode.'}
                        </p>
                      </div>
                    </motion.div>
                  )) || (
                      [...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-video rounded-3xl bg-white/5 animate-pulse" />
                      ))
                    )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black">User Reviews</h3>
                </div>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black">You Might Also Like</h3>
                </div>
                <Row items={recommendations} title="" onItemSelect={(item) => navigate(`/details/${item.media_type || mediaType}/${item.id}`, { state: { movie: item } })} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / Providers */}
      {content["watch/providers"]?.results?.US && (
        <footer className="mt-20 border-t border-white/5 bg-[#020617] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
            <div className="space-y-2">
              <h4 className="text-2xl font-black uppercase tracking-thicker">Where to Watch</h4>
              <p className="text-white/40 font-medium">Available on these streaming platforms</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {content["watch/providers"].results.US.flatrate?.map(provider => (
                <motion.div
                  key={provider.provider_id}
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="group"
                  title={provider.provider_name}
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-white/10 group-hover:border-white/30 transition-all">
                    <img src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`} alt={provider.provider_name} className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="pt-8 flex flex-col items-center gap-4 border-t border-white/5 max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400" />
                <span className="font-black text-xl italic uppercase tracking-widest text-cyan-400">KK-Flix</span>
              </div>
              <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">
                &copy; 2026 KK-Flix Stream. All Rights Reserved. Data provided by TMDB.
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[60] p-4 rounded-2xl bg-cyan-500 text-[#020617] shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_30px_rgba(6,182,212,0.4)] transition-all hover:-translate-y-2 active:scale-95 group"
          >
            <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 lg:p-12"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl shadow-2xl rounded-[2.5rem] overflow-hidden bg-black border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-red-500 text-white rounded-2xl transition-all z-[110] backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title="Trailer"
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