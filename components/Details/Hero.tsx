
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Bookmark, Check, Share2, Star, Clock, Calendar, Youtube, Download, Loader2 } from 'lucide-react';
import { getImageUrl, getPosterUrl } from '../../services/api';
import { MovieDetails, TvDetails, Season } from '../../types';

interface HeroProps {
    content: MovieDetails | TvDetails;
    mediaType: 'movie' | 'tv';
    inWatchlist: boolean;
    onWatchlistToggle: () => void;
    onShare: () => void;
    onPlay: () => void;
    onTrailer: () => void;
    hasTrailer: boolean;
    onDownload: () => void;
    downloadLoading: boolean;
    downloadDisabled: boolean;
    tvSeason?: number;
    tvEpisode?: number;
    onTvSeasonChange?: (season: number) => void;
    onTvEpisodeChange?: (episode: number) => void;
    tvSeasons?: Season[];
    tvEpisodeMax?: number;
}

export const Hero: React.FC<HeroProps> = ({
    content,
    mediaType,
    inWatchlist,
    onWatchlistToggle,
    onShare,
    onPlay,
    onTrailer,
    hasTrailer,
    onDownload,
    downloadLoading,
    downloadDisabled,
    tvSeason,
    tvEpisode,
    onTvSeasonChange,
    onTvEpisodeChange,
    tvSeasons,
    tvEpisodeMax
}) => {
    const title = 'title' in content ? content.title : content.name;
    const releaseDate = 'release_date' in content ? content.release_date : content.first_air_date;
    const year = releaseDate?.split('-')[0] || 'N/A';
    const rating = content.vote_average?.toFixed(1) || '0.0';

    return (
        <div className="relative min-h-[85vh] lg:h-screen w-full overflow-hidden flex items-end pt-[calc(5rem+env(safe-area-inset-top))]">
            {/* Background Image/Video */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/20 to-transparent z-10 lg:from-[#020617]/90" />
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-[5]" />
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    src={getImageUrl(content.backdrop_path)}
                    alt={`${title} backdrop`}
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                />
            </div>

            {/* Content */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-[calc(3rem+env(safe-area-inset-bottom))] lg:pb-24">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

                    {/* Mobile Poster (Above Text) */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative w-48 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <img src={getPosterUrl(content.poster_path)} alt={`${title} poster`} className="w-full h-full object-cover" />
                        </motion.div>
                    </div>

                    {/* Text Info */}
                    <div className="lg:col-span-8 text-center lg:text-left">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4 lg:space-y-6"
                        >
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm font-medium text-white/60">
                                <span className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 uppercase tracking-wider">
                                    {mediaType}
                                </span>
                                {(() => {
                                    const releaseTime = new Date(releaseDate || '').getTime();
                                    const now = Date.now();
                                    const daysSinceRelease = (now - releaseTime) / (1000 * 60 * 60 * 24);
                                    let isInTheaters = daysSinceRelease >= 0 && daysSinceRelease <= 45 && content.status === 'Released';
                                    
                                    // Remove badge if available on Netflix
                                    const providers = content["watch/providers"]?.results?.US;
                                    const isNetflix = providers?.flatrate?.some((p: any) => p.provider_name.toLowerCase().includes('netflix'));
                                    if (isNetflix) {
                                        isInTheaters = false;
                                    }

                                    if (isInTheaters) {
                                        return (
                                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider font-bold animate-pulse">
                                                In Theaters
                                            </span>
                                        );
                                    }
                                    return null;
                                })()}
                                <span className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 10`}>
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    {rating}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1" aria-label={`Release year: ${year}`}>
                                    <Calendar className="w-4 h-4" />
                                    {year}
                                </span>
                                <span>•</span>
                                {mediaType === 'movie' ? (
                                    <span className="flex items-center gap-1" aria-label={`Runtime: ${(content as MovieDetails).runtime} minutes`}>
                                        <Clock className="w-4 h-4" />
                                        {(content as MovieDetails).runtime}m
                                    </span>
                                ) : (
                                    <span aria-label={`${(content as TvDetails).number_of_seasons} seasons`}>{(content as TvDetails).number_of_seasons} Seasons</span>
                                )}
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-8xl font-black text-white leading-[1.1] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] tracking-tighter">
                                {title}
                            </h1>

                            {content.tagline && (
                                <p className="text-xl lg:text-2xl text-white/80 font-medium italic drop-shadow-md max-w-2xl mx-auto lg:mx-0">
                                    "{content.tagline}"
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                {content.genres?.map(genre => (
                                    <span key={genre.id} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold backdrop-blur-md">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onPlay}
                                    className="px-8 py-4 rounded-xl bg-white text-[#020617] font-bold flex items-center gap-3 transition-colors hover:bg-white/90"
                                    aria-label={`Watch ${title} now`}
                                >
                                    <Play className="w-6 h-6 fill-current" />
                                    <span>Watch Now</span>
                                </motion.button>

                                {hasTrailer && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onTrailer}
                                        className="p-4 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20"
                                        title="Watch Trailer"
                                        aria-label={`Watch trailer for ${title}`}
                                    >
                                        <Youtube className="w-6 h-6" />
                                    </motion.button>
                                )}

                                <motion.button
                                    type="button"
                                    whileHover={downloadDisabled ? undefined : { scale: 1.05 }}
                                    whileTap={downloadDisabled ? undefined : { scale: 0.95 }}
                                    onClick={onDownload}
                                    disabled={downloadDisabled || downloadLoading}
                                    className={`px-6 py-4 rounded-xl border backdrop-blur-md flex items-center gap-2 font-semibold transition-all ${downloadDisabled || downloadLoading
                                        ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                                        : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/25'
                                        }`}
                                    title={downloadDisabled ? 'TMDB ID unavailable' : "Search VidVault using this title's TMDB ID"}
                                    aria-label={mediaType === 'movie' ? `Download movie ${title} via VidVault` : `Download episode via VidVault for ${title}`}
                                >
                                    {downloadLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin shrink-0" aria-hidden />
                                    ) : (
                                        <Download className="w-6 h-6 shrink-0" aria-hidden />
                                    )}
                                    <span className="hidden sm:inline">
                                        {mediaType === 'movie' ? 'Download Movie' : 'Download Episode'}
                                    </span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onWatchlistToggle}
                                    className={`p-4 rounded-xl border transition-all backdrop-blur-md flex items-center gap-2 font-semibold ${inWatchlist
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                        }`}
                                    title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                                    aria-label={inWatchlist ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
                                >
                                    {inWatchlist ? <Check className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                                    <span className="hidden sm:inline">{inWatchlist ? "Saved" : "Add to List"}</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onShare}
                                    className="p-4 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/20"
                                    title="Share"
                                    aria-label={`Share ${title}`}
                                >
                                    <Share2 className="w-6 h-6" />
                                </motion.button>
                            </div>

                            {mediaType === 'tv' && tvSeasons && tvSeasons.length > 0 && onTvSeasonChange && onTvEpisodeChange && typeof tvSeason === 'number' && typeof tvEpisode === 'number' && typeof tvEpisodeMax === 'number' && !downloadDisabled && (
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">VidVault</span>
                                    <div className="relative">
                                        <select
                                            value={tvSeason}
                                            onChange={(e) => onTvSeasonChange(parseInt(e.target.value, 10))}
                                            className="appearance-none bg-[#020617]/80 border border-white/15 rounded-xl pl-3 pr-9 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                                            aria-label="Season for download"
                                        >
                                            {tvSeasons.map((s) => (
                                                <option key={s.id} value={s.season_number}>
                                                    Season {s.season_number}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/40 text-[10px]">▾</span>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={Math.min(tvEpisode, tvEpisodeMax)}
                                            onChange={(e) => onTvEpisodeChange(parseInt(e.target.value, 10))}
                                            className="appearance-none bg-[#020617]/80 border border-white/15 rounded-xl pl-3 pr-9 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer min-w-[7rem]"
                                            aria-label="Episode for download"
                                        >
                                            {Array.from({ length: tvEpisodeMax }, (_, i) => i + 1).map((num) => (
                                                <option key={num} value={num}>
                                                    Episode {num}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/40 text-[10px]">▾</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Desktop Poster (Right Side) */}
                    <div className="hidden lg:block lg:col-span-4 justify-self-end">
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6, type: 'spring', damping: 20 }}
                            className="relative w-full aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-[0_30px_90px_-15px_rgba(0,0,0,0.8)] border border-white/20 group cursor-pointer ring-1 ring-white/10"
                            onClick={onPlay}
                        >
                            <img src={getPosterUrl(content.poster_path)} alt={`${title} poster`} className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[4px]">
                                <div className="w-24 h-24 rounded-full bg-white text-[#020617] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] transform scale-50 group-hover:scale-100 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)">
                                    <Play className="w-10 h-10 fill-current ml-2" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
