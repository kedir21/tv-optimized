
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
        <div className="relative min-h-[80vh] lg:min-h-screen w-full overflow-hidden flex items-end pt-[calc(4rem+env(safe-area-inset-top))]">
            {/* Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/70 to-[var(--bg-primary)]/20 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-transparent z-10 lg:from-[var(--bg-primary)]/80" />

                <motion.img
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.6 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={getImageUrl(content.backdrop_path)}
                    alt={`${title} backdrop`}
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                />
            </div>

            {/* Content */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] lg:pb-20">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">

                    {/* Desktop Poster */}
                    <div className="hidden md:flex justify-center lg:block lg:col-span-4 z-30 mb-6 lg:mb-0">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                            className="relative w-56 lg:w-full max-w-[20rem] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/[0.06] group cursor-pointer"
                            onClick={onPlay}
                        >
                            <img src={getPosterUrl(content.poster_path)} alt={`${title} poster`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/90 text-[var(--bg-primary)] flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                    <Play className="w-6 h-6 fill-current ml-1" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Mobile Poster */}
                    <div className="md:hidden flex justify-center mb-4">
                        <motion.div
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="relative w-40 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06]"
                        >
                            <img src={getPosterUrl(content.poster_path)} alt={`${title} poster`} className="w-full h-full object-cover" />
                        </motion.div>
                    </div>

                    {/* Text Info */}
                    <div className="lg:col-span-8 text-center md:text-left flex flex-col md:items-start items-center">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="space-y-4 lg:space-y-5 w-full"
                        >
                            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                                <span className="px-2.5 py-1 rounded-md bg-white/[0.06] text-white/70">
                                    {mediaType}
                                </span>
                                {(() => {
                                    const releaseTime = new Date(releaseDate || '').getTime();
                                    const now = Date.now();
                                    const daysSinceRelease = (now - releaseTime) / (1000 * 60 * 60 * 24);
                                    let isInTheaters = daysSinceRelease >= 0 && daysSinceRelease <= 45 && content.status === 'Released';
                                    
                                    const providers = content["watch/providers"]?.results?.US;
                                    const isNetflix = providers?.flatrate?.some((p: any) => p.provider_name.toLowerCase().includes('netflix'));
                                    if (isNetflix) isInTheaters = false;

                                    if (isInTheaters) {
                                        return (
                                            <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/20">
                                                In Theaters
                                            </span>
                                        );
                                    }
                                    return null;
                                })()}
                                <span className="flex items-center gap-1 text-amber-400">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    {rating}
                                </span>
                                <span className="text-white/20">•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {year}
                                </span>
                                <span className="text-white/20">•</span>
                                {mediaType === 'movie' ? (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {(content as MovieDetails).runtime}m
                                    </span>
                                ) : (
                                    <span>{(content as TvDetails).number_of_seasons} Seasons</span>
                                )}
                            </div>

                            {content.tagline && (
                                <p className="text-base lg:text-lg text-white/30 font-light italic max-w-xl mx-auto md:mx-0">
                                    "{content.tagline}"
                                </p>
                            )}

                            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                                {content.genres?.map(genre => (
                                    <span key={genre.id} className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.04] text-[11px] font-medium text-white/50 cursor-default">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onPlay}
                                    className="px-7 flex-1 sm:flex-none py-3.5 rounded-xl bg-white text-[var(--bg-primary)] font-bold flex justify-center items-center gap-2.5 transition-colors hover:bg-white/90 shadow-lg text-sm"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>Watch Now</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onWatchlistToggle}
                                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 font-semibold flex-1 sm:flex-none text-sm ${inWatchlist
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        : 'bg-white/[0.04] border-white/[0.06] text-white/80 hover:bg-white/[0.08]'
                                        }`}
                                >
                                    {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                    <span>{inWatchlist ? "Saved" : "My List"}</span>
                                </motion.button>

                                {hasTrailer && (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={onTrailer}
                                        className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/70 hover:text-white transition-all hover:bg-white/[0.08] flex-1 sm:flex-none flex justify-center"
                                        title="Watch Trailer"
                                    >
                                        <Youtube className="w-4 h-4" />
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onShare}
                                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/70 hover:text-white transition-all hover:bg-white/[0.08]"
                                    title="Share"
                                >
                                    <Share2 className="w-4 h-4" />
                                </motion.button>
                            </div>

                            {mediaType === 'tv' && tvSeasons && tvSeasons.length > 0 && onTvSeasonChange && onTvEpisodeChange && typeof tvSeason === 'number' && typeof tvEpisode === 'number' && typeof tvEpisodeMax === 'number' && !downloadDisabled && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">Download</span>
                                    <div className="relative">
                                        <select
                                            value={tvSeason}
                                            onChange={(e) => onTvSeasonChange(parseInt(e.target.value, 10))}
                                            className="appearance-none bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-white/80 focus:outline-none focus:border-rose-500/40 transition-all cursor-pointer"
                                        >
                                            {tvSeasons.map((s) => (
                                                <option key={s.id} value={s.season_number} className="bg-[var(--bg-card)]">
                                                    Season {s.season_number}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[9px]">▾</span>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={Math.min(tvEpisode, tvEpisodeMax)}
                                            onChange={(e) => onTvEpisodeChange(parseInt(e.target.value, 10))}
                                            className="appearance-none bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-white/80 focus:outline-none focus:border-rose-500/40 transition-all cursor-pointer min-w-[6rem]"
                                        >
                                            {Array.from({ length: tvEpisodeMax }, (_, i) => i + 1).map((num) => (
                                                <option key={num} value={num} className="bg-[var(--bg-card)]">
                                                    Episode {num}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-[9px]">▾</span>
                                    </div>
                                     <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onDownload}
                                        disabled={downloadLoading}
                                        className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white/80 disabled:opacity-40 transition-all hover:bg-white/[0.08]"
                                        title="Download Selected Episode via VidVault"
                                    >
                                        {downloadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    </motion.button>
                                </div>
                            )}

                             {mediaType === 'movie' && !downloadDisabled && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start pt-2">
                                     <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={onDownload}
                                        disabled={downloadLoading}
                                        className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white/80 disabled:opacity-40 transition-all flex items-center gap-2 font-medium text-xs hover:bg-white/[0.08]"
                                    >
                                        {downloadLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                        <span>Download</span>
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
