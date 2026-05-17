import React from 'react';
import { motion } from 'framer-motion';
import { Play, Bookmark, Check, Share2, Star, Clock, Calendar, Youtube, Download, Loader2, Plus } from 'lucide-react';
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
        <div className="relative min-h-[90vh] lg:min-h-screen w-full flex items-end">
            {/* Backdrop Banner */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={getImageUrl(content.backdrop_path, 'original')} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-[#040406]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#040406] via-[#040406]/40 to-transparent" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-16 lg:pb-24">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-8 lg:gap-16">
                    
                    {/* Floating Poster */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-48 md:w-64 lg:w-80 aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)] border border-white/10 group flex-shrink-0"
                    >
                        <img src={getPosterUrl(content.poster_path)} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                    </motion.div>

                    {/* Metadata & Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 text-center md:text-left"
                    >
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                                {mediaType}
                            </span>
                            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                                <Star size={14} className="fill-current" />
                                {rating}
                            </div>
                            <span className="text-white/20">•</span>
                            <span className="text-sm font-medium text-white/50">{year}</span>
                            <span className="text-white/20">•</span>
                            <span className="text-sm font-medium text-white/50">
                                {mediaType === 'movie' ? `${(content as MovieDetails).runtime}m` : `${(content as TvDetails).number_of_seasons} Seasons`}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.95] tracking-tight text-gradient">
                            {title}
                        </h1>

                        <p className="text-base md:text-lg text-white/50 mb-10 line-clamp-3 md:line-clamp-4 max-w-2xl leading-relaxed">
                            {content.overview}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <button
                                onClick={onPlay}
                                className="px-10 py-4 bg-white text-black rounded-2xl font-bold flex items-center gap-3 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-2xl hover:shadow-rose-500/20 active:scale-95"
                            >
                                <Play size={24} className="fill-current" />
                                Watch Now
                            </button>
                            <button
                                onClick={onWatchlistToggle}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 transition-all duration-300 active:scale-95 ${inWatchlist ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/5 text-white hover:bg-white/10'}`}
                            >
                                {inWatchlist ? <Check size={28} /> : <Plus size={28} />}
                            </button>
                            <button
                                onClick={onShare}
                                className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 active:scale-95"
                            >
                                <Share2 size={24} />
                            </button>
                            {hasTrailer && (
                                <button
                                    onClick={onTrailer}
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 active:scale-95"
                                >
                                    <Youtube size={24} />
                                </button>
                            )}
                        </div>

                        {/* TV Selectors & Download - Minimal Version */}
                        {(mediaType === 'tv' || mediaType === 'movie') && !downloadDisabled && (
                             <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                                {mediaType === 'tv' && tvSeasons && (
                                    <>
                                        <select
                                            value={tvSeason}
                                            onChange={(e) => onTvSeasonChange?.(parseInt(e.target.value))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white uppercase tracking-wider outline-none focus:border-rose-500/50 transition-colors cursor-pointer"
                                        >
                                            {tvSeasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#0a0a0f]">Season {s.season_number}</option>)}
                                        </select>
                                        <select
                                            value={tvEpisode}
                                            onChange={(e) => onTvEpisodeChange?.(parseInt(e.target.value))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white uppercase tracking-wider outline-none focus:border-rose-500/50 transition-colors cursor-pointer"
                                        >
                                            {Array.from({ length: tvEpisodeMax || 0 }, (_, i) => i + 1).map(num => <option key={num} value={num} className="bg-[#0a0a0f]">Episode {num}</option>)}
                                        </select>
                                    </>
                                )}
                                <button
                                    onClick={onDownload}
                                    disabled={downloadLoading}
                                    className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/50 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {downloadLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                    Download {mediaType === 'tv' ? 'Episode' : 'Movie'}
                                </button>
                             </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
