
import React, { useEffect, useState, useMemo, useCallback } from 'react';
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

import { getVidVaultUrl } from '../utils/vidvault';

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
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadEpisode, setDownloadEpisode] = useState(1);

  const mediaType = (type as 'movie' | 'tv') || 'movie';

  const episodeMaxForSeason = useMemo(() => {
    if (mediaType !== 'tv' || !content || !('seasons' in content)) return 1;
    const sn = selectedSeasonNumber;
    if (seasonDetails?.season_number === sn && seasonDetails.episodes?.length)
      return Math.max(1, seasonDetails.episodes.length);
    const s = content.seasons?.find((se) => se.season_number === sn);
    return Math.max(1, s?.episode_count ?? 1);
  }, [mediaType, content, selectedSeasonNumber, seasonDetails]);

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

  useEffect(() => {
    setDownloadEpisode(1);
  }, [selectedSeasonNumber]);

  useEffect(() => {
    if (downloadEpisode > episodeMaxForSeason) setDownloadEpisode(episodeMaxForSeason);
  }, [episodeMaxForSeason, downloadEpisode]);

  const handleVidVaultDownload = useCallback(async () => {
    if (!content?.id) {
      setNotification({ message: 'TMDB ID not found for this title.', type: 'error' });
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    
    try {
      const tvSeasonsOk =
        mediaType === 'tv' &&
        'seasons' in content &&
        (content as TvDetails).seasons?.some((s) => s.season_number > 0);
      const url = getVidVaultUrl(
        content.id,
        mediaType,
        mediaType === 'tv' && tvSeasonsOk
          ? {
              season: selectedSeasonNumber,
              episode: Math.min(downloadEpisode, episodeMaxForSeason),
            }
          : undefined
      );

      const w = window.open(url, '_blank', 'noopener,noreferrer');
      
      setDownloadLoading(true);
      await new Promise((r) => setTimeout(r, 180));
      setDownloadLoading(false);

      if (!w) {
        setNotification({ message: 'Popup blocked. Allow popups to open VidVault.', type: 'error' });
      } else {
        setNotification({
          message: 'Opened VidVault in a new tab.',
          type: 'success',
        });
      }
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      setDownloadLoading(false);
    }
  }, [content, mediaType, selectedSeasonNumber, downloadEpisode, episodeMaxForSeason]);

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
    <div className="min-h-screen text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed top-5 right-5 z-[60]"
          >
            <div className={`glass-strong px-4 py-3 rounded-xl shadow-xl ${notification.type === 'success'
              ? 'border-emerald-500/20 text-emerald-300'
              : 'border-red-500/20 text-red-300'
              }`}>
              <p className="text-xs font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
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
        onDownload={handleVidVaultDownload}
        downloadLoading={downloadLoading}
        downloadDisabled={!content.id}
        {...(mediaType === 'tv'
          ? {
              tvSeason: selectedSeasonNumber,
              tvEpisode: downloadEpisode,
              onTvSeasonChange: setSelectedSeasonNumber,
              onTvEpisodeChange: setDownloadEpisode,
              tvSeasons: (content as TvDetails).seasons?.filter((s) => s.season_number > 0) ?? [],
              tvEpisodeMax: episodeMaxForSeason,
            }
          : {})}
      />

      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={filteredTabs}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
                <div className="lg:col-span-2 space-y-10">
                  {/* Synopsis */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white/[0.04] text-white/40">
                        <Info className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold">Synopsis</h3>
                    </div>
                    <div className="relative">
                      <p className={`text-sm lg:text-base text-white/50 leading-relaxed ${!expandedOverview && content.overview?.length > 400 ? 'line-clamp-4' : ''}`}>
                        {content.overview || 'No synopsis available for this title.'}
                      </p>
                      {content.overview?.length > 400 && (
                        <button
                          onClick={() => setExpandedOverview(!expandedOverview)}
                          className="mt-3 text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors flex items-center gap-1 group"
                        >
                          {expandedOverview ? 'View less' : 'Read full synopsis'}
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedOverview ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Trailer */}
                  {trailer && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-white/[0.04] text-white/40">
                          <Film className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Official Trailer</h3>
                      </div>
                      <div className="aspect-video rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.04] shadow-xl">
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

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white/[0.03] border border-white/[0.04] rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-white/30" />
                      <h4 className="text-base font-bold">Details</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      {director && (
                        <div>
                          <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-1">Director</p>
                          <p className="text-sm font-medium text-white/80">{director}</p>
                        </div>
                      )}
                      {(writers || creators) && (
                        <div>
                          <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-1">
                            {mediaType === 'movie' ? 'Writers' : 'Creators'}
                          </p>
                          <p className="text-sm font-medium text-white/80">{writers || creators}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-1">Status</p>
                        <p className="text-sm font-medium text-white/80">{content.status || 'Released'}</p>
                      </div>
                      {mediaType === 'movie' && (content as MovieDetails).budget > 0 && (
                        <div>
                          <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-1">Budget</p>
                          <p className="text-sm font-medium text-white/80">
                            ${((content as MovieDetails).budget / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-1">Languages</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {content.spoken_languages?.slice(0, 3).map(lang => (
                            <span key={lang.iso_639_1} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.04] text-xs text-white/60">
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
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-[var(--bg-primary)] font-semibold text-sm transition-all hover:bg-white/90 mt-4"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Official Website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Production Companies */}
                  <div className="bg-white/[0.03] border border-white/[0.04] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-white/30" />
                      <h4 className="text-base font-bold">Production</h4>
                    </div>
                    <div className="space-y-3">
                      {content.production_companies?.slice(0, 4).map(company => (
                        <div key={company.id} className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center p-1.5 border border-white/[0.04]">
                            {company.logo_path ? (
                              <img src={`https://image.tmdb.org/t/p/w92${company.logo_path}`} alt={company.name} className="max-w-full max-h-full object-contain filter invert brightness-200 opacity-60" />
                            ) : (
                              <Building2 className="w-4 h-4 text-white/25" />
                            )}
                          </div>
                          <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{company.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cast' && (
              <div className="space-y-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white/[0.04] text-white/40">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Main Cast</h3>
                </div>
                
                <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-5 snap-x snap-mandatory no-scrollbar">
                  {content.credits?.cast?.slice(0, 18).map(person => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      className="group flex flex-col items-center flex-shrink-0 w-28 sm:w-36 snap-start"
                    >
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3 border border-white/[0.04] group-hover:border-white/[0.1] transition-all">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                            <Users className="w-8 h-8 text-white/15" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-center text-sm text-white line-clamp-1 group-hover:text-rose-400 transition-colors px-1">{person.name}</h4>
                      <p className="text-[11px] text-white/30 text-center line-clamp-1 italic mt-0.5 px-1">{person.character}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="p-2 rounded-lg bg-white/[0.04] text-white/40">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Featured Crew</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {content.credits?.crew?.filter(c => ['Director', 'Producer', 'Executive Producer', 'Writer', 'Director of Photography', 'Original Music Composer'].includes(c.job)).slice(0, 8).map(person => (
                      <div key={`${person.id}-${person.job}`} className="space-y-1">
                        <p className="text-white/25 text-[10px] font-medium uppercase tracking-wider">{person.job}</p>
                        <p className="text-sm font-semibold text-white/80">{person.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'episodes' && mediaType === 'tv' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/[0.04] text-white/40">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Episode Guide</h3>
                  </div>
                  <div className="relative group">
                    <select
                      value={selectedSeasonNumber}
                      onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                      className="appearance-none bg-white/[0.04] border border-white/[0.06] rounded-xl px-5 pr-10 py-3 text-white font-semibold text-sm focus:outline-none focus:border-rose-500/40 transition-all cursor-pointer hover:bg-white/[0.06] active:scale-[0.98]"
                    >
                      {content.seasons?.filter(s => s.season_number > 0).map((season) => (
                        <option key={season.id} value={season.season_number}>
                          Season {season.season_number}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {seasonDetails?.episodes.map((episode) => (
                    <motion.div
                      key={episode.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate(`/watch/${content.id}?type=tv&s=${episode.season_number}&e=${episode.episode_number}`)}
                      className="group bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden flex flex-col sm:flex-row cursor-pointer transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.08] w-full"
                    >
                      <div className="relative w-full sm:w-56 md:w-72 aspect-video flex-shrink-0 overflow-hidden">
                        {episode.still_path ? (
                          <img
                            src={getStillUrl(episode.still_path)}
                            alt={episode.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center">
                            <Film className="w-8 h-8 text-white/10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--bg-primary)] opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        {episode.runtime && (
                          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[11px] font-medium text-white/70">
                            {episode.runtime}m
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 sm:p-5 flex flex-col justify-center flex-grow">
                        <span className="text-rose-400/70 font-semibold text-xs uppercase tracking-wider mb-1">Episode {episode.episode_number}</span>
                        <h4 className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-1 mb-1.5">
                          {episode.name}
                        </h4>
                        <p className="text-white/35 text-xs line-clamp-2 md:line-clamp-3 leading-relaxed">
                          {episode.overview || 'No plot summary available.'}
                        </p>
                      </div>
                    </motion.div>
                  )) || (
                      [...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 sm:h-36 rounded-xl shimmer w-full" style={{ backgroundColor: 'var(--bg-card)' }} />
                      ))
                    )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white/[0.04] text-white/40">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">User Reviews</h3>
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="space-y-8">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white/[0.04] text-white/40">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">You Might Also Like</h3>
                </div>
                <Row
                  items={recommendations}
                  title=""
                  onItemSelect={(item) =>
                    navigate(`/details/${item.media_type || mediaType}/${item.id}`)
                  }
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Providers Footer */}
      {content["watch/providers"]?.results?.US && (
        <footer className="mt-16 border-t border-white/[0.04] py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold">Where to Watch</h4>
              <p className="text-white/30 text-sm">Available on these platforms</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {content["watch/providers"].results.US.flatrate?.map(provider => (
                <motion.div
                  key={provider.provider_id}
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="group"
                  title={provider.provider_name}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/[0.06] group-hover:border-white/[0.12] transition-all">
                    <img src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`} alt={provider.provider_name} className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="pt-6 flex flex-col items-center gap-2 border-t border-white/[0.04] max-w-md mx-auto">
              <span className="font-bold text-sm text-white/40 tracking-wider">KK-Flix</span>
              <p className="text-white/15 text-[10px] font-medium uppercase tracking-[0.2em]">
                &copy; 2026 KK-Flix Stream. Data by TMDB.
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 md:bottom-8 right-6 z-[60] p-3 rounded-xl glass text-white/60 hover:text-white shadow-xl hover:bg-white/10 transition-all active:scale-95 group"
          >
            <ArrowUp className="w-5 h-5" />
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
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-black border border-white/[0.06]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-rose-500 text-white rounded-xl transition-all z-[110] backdrop-blur-md"
              >
                <X className="w-5 h-5" />
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