import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Info, ArrowUp, Globe, ExternalLink, Building2, Sparkles, Film, ChevronDown, Share2,
} from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { MovieDetails, TvDetails, SeasonDetails, ContentItem } from '../types';
import { Hero } from '../components/Details/Hero';
import { CastCarousel } from '../components/Details/CastCarousel';
import { EpisodeSection } from '../components/Details/EpisodeSection';
import { SimilarCarousel } from '../components/Details/SimilarCarousel';
import { DetailsSkeleton } from '../components/Skeletons';
import { CinematicBackground } from '../components/CinematicBackground';
import { getVidVaultUrl } from '../utils/vidvault';
import Meta from '../components/Meta';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = location.state?.movie as ContentItem | undefined;
  const [content, setContent] = useState<MovieDetails | TvDetails | null>(null);
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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
    const fetchDetails = async () => {
      if (!id) return;
      if (!initialData) setLoading(true);

      try {
        const [data, recs] = await Promise.all([
          api.getDetails(id, mediaType),
          api.getRecommendations(parseInt(id, 10), mediaType),
        ]);

        (data as ContentItem).media_type = mediaType;
        setContent(data as MovieDetails | TvDetails);
        setRecommendations(recs);

        const inList = await watchlistService.isInWatchlist(data.id);
        setInWatchlist(inList);

        if (mediaType === 'tv' && 'seasons' in data && data.seasons?.length) {
          const firstSeason = data.seasons.find((s) => s.season_number > 0) || data.seasons[0];
          setSelectedSeasonNumber(firstSeason.season_number);
        }
      } catch (err) {
        console.error(err);
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
        const data = await api.getSeasonDetails(parseInt(id, 10), selectedSeasonNumber);
        setSeasonDetails(data);
      } catch (e) {
        console.error('Failed to load season', e);
      }
    };
    fetchSeason();
  }, [selectedSeasonNumber, content?.id, mediaType, id]);

  const handleWatchlistToggle = async () => {
    if (!content) return;
    await watchlistService.toggleWatchlist(content as ContentItem);
    setInWatchlist((prev) => !prev);
    setNotification({
      message: inWatchlist ? 'Removed from Watchlist' : 'Added to Watchlist',
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShare = async () => {
    const title = content ? ('title' in content ? content.title : content.name) : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on K-Flix!`,
          url: window.location.href,
        });
      } catch { /* ... */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setNotification({ message: 'Link copied to clipboard', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleVidVaultDownload = useCallback(() => {
    if (!content?.id) return;
    const url = getVidVaultUrl(
      content.id,
      mediaType,
      mediaType === 'tv' ? { season: selectedSeasonNumber, episode: downloadEpisode } : undefined
    );
    // Use a direct anchor click for better cross-origin behavior on Vercel
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [content, mediaType, selectedSeasonNumber, downloadEpisode]);

  if (loading || !content) return <DetailsSkeleton />;

  const trailer = content.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
  const contentTitle = 'title' in content ? content.title : content.name;

  return (
    <div className="relative min-h-screen">
      <CinematicBackground heroBackdropPath={content.backdrop_path} />

      <Meta
        title={contentTitle}
        description={content.overview?.substring(0, 160)}
        image={getImageUrl(content.backdrop_path)}
      />

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-white text-black font-bold shadow-2xl flex items-center gap-3"
          >
            <Sparkles size={18} className="text-rose-500" />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full">
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

        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-4">
          <CastCarousel cast={content.credits?.cast ?? []} />

          {mediaType === 'tv' && (
            <EpisodeSection
              content={content as TvDetails}
              seasonDetails={seasonDetails}
              selectedSeason={selectedSeasonNumber}
              onSeasonChange={setSelectedSeasonNumber}
            />
          )}

          <SimilarCarousel
            items={recommendations}
            mediaType={mediaType}
            onSelect={(item) => navigate(`/details/${item.media_type || mediaType}/${item.id}`)}
          />
        </main>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTrailer(false)}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Details;
