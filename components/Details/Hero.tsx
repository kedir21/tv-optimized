import React from 'react';
import { motion } from 'framer-motion';
import { Play, Check, Share2, Star, Clock, Calendar, Youtube, Download, Loader2, Plus, Info, Globe, Shield } from 'lucide-react';
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
        <div className="relative min-h-screen w-full flex items-center overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ duration: 1.5 }}
                    src={getImageUrl(content.backdrop_path)} 
                    alt="" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#040406]/90 lg:bg-[#040406]/70" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-transparent to-[#040406]/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#040406] via-[#040406]/40 to-transparent" />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pt-32 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 lg:gap-24 items-center">
                    
                    {/* Premium Poster Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: -50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative aspect-[2/3] rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10 group">
                            <img 
                                src={getPosterUrl(content.poster_path)} 
                                alt={title} 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        {/* Status Floaties */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-500/20 blur-3xl rounded-full" />
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full" />
                    </motion.div>

                    {/* Information Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center lg:items-start text-center lg:text-left"
                    >
                        {/* Quick Tags */}
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <div className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{mediaType}</span>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center gap-2">
                                <Star size={14} className="text-amber-400 fill-current" />
                                <span className="text-xs font-bold text-white">{rating}</span>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center gap-2">
                                <Calendar size={14} className="text-white/40" />
                                <span className="text-xs font-bold text-white/60">{year}</span>
                            </div>
                            {mediaType === 'movie' ? (
                                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center gap-2">
                                    <Clock size={14} className="text-white/40" />
                                    <span className="text-xs font-bold text-white/60">{(content as MovieDetails).runtime} min</span>
                                </div>
                            ) : (
                                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center gap-2">
                                    <Shield size={14} className="text-white/40" />
                                    <span className="text-xs font-bold text-white/60">{(content as TvDetails).number_of_seasons} Seasons</span>
                                </div>
                            )}
                        </div>

                        {/* Title & Overview */}
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-black text-white mb-8 leading-tight tracking-tighter drop-shadow-2xl">
                            {title}
                        </h1>

                        <div className="relative max-w-2xl mb-12">
                            <div className="absolute -left-10 top-0 hidden lg:block opacity-20">
                                <Info size={40} className="text-rose-500" />
                            </div>
                            <p className="text-lg md:text-xl text-white/50 font-medium leading-relaxed line-clamp-4">
                                {content.overview}
                            </p>
                        </div>

                        {/* Dynamic Action Controls */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 w-full lg:w-auto">
                            <button
                                onClick={onPlay}
                                className="h-16 px-12 bg-white text-black rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center gap-4 hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-rose-500/40 active:scale-95 group"
                            >
                                <Play size={24} className="fill-current group-hover:scale-110 transition-transform" />
                                Watch Premiere
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onWatchlistToggle}
                                    className={`w-16 h-16 rounded-[24px] flex items-center justify-center border transition-all duration-500 active:scale-95 ${inWatchlist ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                >
                                    {inWatchlist ? <Check size={28} /> : <Plus size={28} />}
                                </button>
                                <button
                                    onClick={onShare}
                                    className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                                >
                                    <Share2 size={24} />
                                </button>
                                {hasTrailer && (
                                    <button
                                        onClick={onTrailer}
                                        className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 text-[#FF0000] flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        <Youtube size={28} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Selector & Download Hub */}
                        {!downloadDisabled && (
                             <div className="mt-12 w-full p-8 rounded-[32px] bg-white/[0.03] border border-white/5 backdrop-blur-2xl flex flex-wrap items-center justify-center lg:justify-start gap-8">
                                {mediaType === 'tv' && tvSeasons && (
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <select
                                                value={tvSeason}
                                                onChange={(e) => onTvSeasonChange?.(parseInt(e.target.value))}
                                                className="appearance-none bg-black/40 border border-white/10 rounded-2xl pl-6 pr-12 py-4 text-xs font-black text-white/50 uppercase tracking-widest outline-none focus:border-rose-500/50 hover:bg-black/60 transition-all cursor-pointer box-border min-w-[180px]"
                                            >
                                                {tvSeasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#0a0a0f]">Season {s.season_number}</option>)}
                                            </select>
                                            <Globe size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={tvEpisode}
                                                onChange={(e) => onTvEpisodeChange?.(parseInt(e.target.value))}
                                                className="appearance-none bg-black/40 border border-white/10 rounded-2xl pl-6 pr-12 py-4 text-xs font-black text-white/50 uppercase tracking-widest outline-none focus:border-rose-500/50 hover:bg-black/60 transition-all cursor-pointer box-border min-w-[150px]"
                                            >
                                                {Array.from({ length: tvEpisodeMax || 0 }, (_, i) => i + 1).map(num => <option key={num} value={num} className="bg-[#0a0a0f]">Episode {num}</option>)}
                                            </select>
                                            <Clock size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onDownload();
                                    }}
                                    disabled={downloadLoading}
                                    className="flex items-center gap-4 px-10 py-4 bg-white/5 border border-rose-500/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-xl disabled:opacity-50 group grow lg:grow-0"
                                >
                                    {downloadLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={18} className="group-hover:-translate-y-1 transition-transform" />}
                                    Direct Download {mediaType === 'tv' ? 'HQ' : 'Full HD'}
                                </button>
                             </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
