
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
                
                {/* Ambient Glow Effects */}
                <div className="absolute top-[-10%] -left-[10%] w-[40%] h-[40%] bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob z-[6]" />
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob z-[6]" style={{ animationDelay: '2s' }} />
                <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob z-[6]" style={{ animationDelay: '4s' }} />

                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    src={getImageUrl(content.backdrop_path)}
                    alt={`${title} backdrop`}
                    className="w-full h-full object-cover mix-blend-overlay opacity-80"
                    fetchPriority="high"
                />
            </div>

            {/* Content */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-[calc(3rem+env(safe-area-inset-bottom))] lg:pb-24">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center lg:items-end">

                    {/* Desktop/Tablet Poster (Left Side) */}
                    <div className="hidden md:flex justify-center lg:block lg:col-span-4 perspective-1000 z-30 mb-8 lg:mb-0">
                        <motion.div
                            initial={{ y: 50, opacity: 0, rotateY: -10 }}
                            animate={{ y: 0, opacity: 1, rotateY: 5 }}
                            whileHover={{ scale: 1.03, rotateY: 0, rotateX: 5, z: 50 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
                            className="relative w-64 lg:w-full max-w-[22rem] aspect-[2/3] rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 group cursor-pointer animate-float backdrop-blur-md"
                            onClick={onPlay}
                        >
                            <img src={getPosterUrl(content.poster_path)} alt={`${title} poster`} className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                                <div className="w-20 h-20 rounded-full bg-white text-[#020617] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] transform scale-50 group-hover:scale-100 transition-transform duration-500">
                                    <Play className="w-8 h-8 fill-current ml-1" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Mobile Poster (Above Text, Only on small screens) */}
                    <div className="md:hidden flex justify-center mb-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative w-48 sm:w-56 aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
                        >
                            <img src={getPosterUrl(content.poster_path)} alt={`${title} poster`} className="w-full h-full object-cover" />
                        </motion.div>
                    </div>

                    {/* Text Info (Right Side) */}
                    <div className="lg:col-span-8 text-center md:text-left flex flex-col md:items-start items-center">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-5 lg:space-y-6 w-full"
                        >
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.1] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] tracking-tighter">
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm font-semibold text-white/70 uppercase tracking-widest pt-2">
                                <span className="px-3 py-1 rounded bg-white/10 text-white backdrop-blur-md border border-white/10">
                                    {mediaType}
                                </span>
                                {(() => {
                                    const releaseTime = new Date(releaseDate || '').getTime();
                                    const now = Date.now();
                                    const daysSinceRelease = (now - releaseTime) / (1000 * 60 * 60 * 24);
                                    let isInTheaters = daysSinceRelease >= 0 && daysSinceRelease <= 45 && content.status === 'Released';
                                    
                                    const providers = content["watch/providers"]?.results?.US;
                                    const isNetflix = providers?.flatrate?.some((p: any) => p.provider_name.toLowerCase().includes('netflix'));
                                    if (isNetflix) {
                                        isInTheaters = false;
                                    }

                                    if (isInTheaters) {
                                        return (
                                            <span className="px-3 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                                                In Theaters
                                            </span>
                                        );
                                    }
                                    return null;
                                })()}
                                <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded border border-yellow-500/20">
                                    <Star className="w-4 h-4 fill-current" />
                                    {rating}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {year}
                                </span>
                                <span>•</span>
                                {mediaType === 'movie' ? (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {(content as MovieDetails).runtime}m
                                    </span>
                                ) : (
                                    <span>{(content as TvDetails).number_of_seasons} Seasons</span>
                                )}
                            </div>

                            {content.tagline && (
                                <p className="text-xl lg:text-2xl text-white/50 font-light italic max-w-2xl mx-auto md:mx-0 pt-2">
                                    "{content.tagline}"
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                                {content.genres?.map(genre => (
                                    <span key={genre.id} className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-xs font-bold text-white/80 backdrop-blur-md cursor-default">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onPlay}
                                    className="px-8 flex-1 sm:flex-none py-4 rounded-2xl bg-white text-[#020617] font-black flex justify-center items-center gap-3 transition-colors hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] ring-2 ring-white/50"
                                >
                                    <Play className="w-6 h-6 fill-current" />
                                    <span className="uppercase tracking-widest text-sm">Watch</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onWatchlistToggle}
                                    className={`p-4 rounded-2xl border transition-all backdrop-blur-md flex items-center justify-center gap-2 font-bold flex-1 sm:flex-none uppercase tracking-widest text-sm ${inWatchlist
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                        }`}
                                >
                                    {inWatchlist ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                                    <span className="inline">{inWatchlist ? "Saved" : "List"}</span>
                                </motion.button>

                                {hasTrailer && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onTrailer}
                                        className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-md transition-all hover:bg-white/10 flex-1 sm:flex-none flex justify-center"
                                        title="Watch Trailer"
                                    >
                                        <Youtube className="w-5 h-5" />
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onShare}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-md transition-all hover:bg-white/10"
                                    title="Share"
                                >
                                    <Share2 className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {mediaType === 'tv' && tvSeasons && tvSeasons.length > 0 && onTvSeasonChange && onTvEpisodeChange && typeof tvSeason === 'number' && typeof tvEpisode === 'number' && typeof tvEpisodeMax === 'number' && !downloadDisabled && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Download</span>
                                    <div className="relative">
                                        <select
                                            value={tvSeason}
                                            onChange={(e) => onTvSeasonChange(parseInt(e.target.value, 10))}
                                            className="appearance-none bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-white/90 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                                        >
                                            {tvSeasons.map((s) => (
                                                <option key={s.id} value={s.season_number} className="bg-slate-900">
                                                    Season {s.season_number}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-[10px]">▾</span>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={Math.min(tvEpisode, tvEpisodeMax)}
                                            onChange={(e) => onTvEpisodeChange(parseInt(e.target.value, 10))}
                                            className="appearance-none bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-white/90 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer min-w-[7rem]"
                                        >
                                            {Array.from({ length: tvEpisodeMax }, (_, i) => i + 1).map((num) => (
                                                <option key={num} value={num} className="bg-slate-900">
                                                    Episode {num}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-[10px]">▾</span>
                                    </div>
                                     <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onDownload}
                                        disabled={downloadLoading}
                                        className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-50 transition-all"
                                        title="Download Selected Episode via VidVault"
                                    >
                                        {downloadLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                    </motion.button>
                                </div>
                            )}

                             {mediaType === 'movie' && !downloadDisabled && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start pt-4">
                                     <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onDownload}
                                        disabled={downloadLoading}
                                        className="px-6 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2 font-bold text-sm uppercase tracking-widest"
                                    >
                                        {downloadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
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
