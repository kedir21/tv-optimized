import React from 'react';
import { motion } from 'framer-motion';
import { Play, Check, Share2, Star, Clock, Calendar, Youtube, Download, Loader2, Plus, Info, ChevronRight } from 'lucide-react';
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
        <div className="relative min-h-[85vh] w-full flex items-center pt-20">
            {/* Minimal Background */}
            <div className="absolute inset-0 z-0">
                <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 1.2 }}
                    src={getImageUrl(content.backdrop_path)} 
                    alt="" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-[#040406]/80 to-[#040406]/40" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 lg:gap-20">
                    
                    {/* Compact Poster */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden lg:block shrink-0"
                    >
                        <div className="w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                            <img src={getPosterUrl(content.poster_path)} alt={title} className="w-full h-full object-cover" />
                        </div>
                    </motion.div>

                    <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                        {/* Clean Metadata */}
                        <div className="flex items-center gap-4 mb-6 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-1.5 text-amber-500">
                                <Star size={12} className="fill-current" />
                                <span className="text-white">{rating}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span>{year}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span>{mediaType === 'movie' ? `${(content as MovieDetails).runtime}m` : `${(content as TvDetails).number_of_seasons} Seasons`}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight max-w-3xl leading-[1.1]">
                            {title}
                        </h1>

                        <p className="text-base md:text-lg text-white/50 font-medium max-w-2xl mb-10 leading-relaxed line-clamp-3">
                            {content.overview}
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                            <button
                                onClick={onPlay}
                                className="h-14 px-10 bg-rose-500 text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                            >
                                <Play size={18} className="fill-current" />
                                Watch Now
                            </button>

                            <button
                                onClick={onWatchlistToggle}
                                className={`h-14 px-6 rounded-2xl border flex items-center gap-2 text-sm font-bold transition-all ${inWatchlist ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
                            >
                                {inWatchlist ? <Check size={18} /> : <Plus size={18} />}
                                {inWatchlist ? 'In Library' : 'Add to List'}
                            </button>

                            <div className="flex items-center gap-2">
                                <button onClick={onShare} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/60 flex items-center justify-center hover:text-white transition-all">
                                    <Share2 size={20} />
                                </button>
                                {hasTrailer && (
                                    <button onClick={onTrailer} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/60 flex items-center justify-center hover:text-rose-500 transition-all">
                                        <Youtube size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Minimalist Season/Download Selector */}
                        {!downloadDisabled && (
                            <div className="flex flex-wrap items-center gap-4 py-6 border-t border-white/5 w-full">
                                {mediaType === 'tv' && tvSeasons && (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={tvSeason}
                                            onChange={(e) => onTvSeasonChange?.(parseInt(e.target.value))}
                                            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white/60 uppercase outline-none cursor-pointer min-w-[120px]"
                                        >
                                            {tvSeasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#0a0a0f]">Season {s.season_number}</option>)}
                                        </select>
                                        <select
                                            value={tvEpisode}
                                            onChange={(e) => onTvEpisodeChange?.(parseInt(e.target.value))}
                                            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white/60 uppercase outline-none cursor-pointer min-w-[120px]"
                                        >
                                            {Array.from({ length: tvEpisodeMax || 0 }, (_, i) => i + 1).map(num => <option key={num} value={num} className="bg-[#0a0a0f]">Episode {num}</option>)}
                                        </select>
                                    </div>
                                )}
                                
                                <button
                                    onClick={onDownload}
                                    disabled={downloadLoading}
                                    className="h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    {downloadLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                    Download HQ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
