
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Bookmark, Check, Share2, Star, Clock, Calendar, Youtube } from 'lucide-react';
import { getImageUrl, getPosterUrl } from '../../services/api';
import { MovieDetails, TvDetails } from '../../types';

interface HeroProps {
    content: MovieDetails | TvDetails;
    mediaType: 'movie' | 'tv';
    inWatchlist: boolean;
    onWatchlistToggle: () => void;
    onShare: () => void;
    onPlay: () => void;
    onTrailer: () => void;
    hasTrailer: boolean;
}

export const Hero: React.FC<HeroProps> = ({
    content,
    mediaType,
    inWatchlist,
    onWatchlistToggle,
    onShare,
    onPlay,
    onTrailer,
    hasTrailer
}) => {
    const title = 'title' in content ? content.title : content.name;
    const releaseDate = 'release_date' in content ? content.release_date : content.first_air_date;
    const year = releaseDate?.split('-')[0] || 'N/A';
    const rating = content.vote_average?.toFixed(1) || '0.0';

    return (
        <div className="relative min-h-[85vh] lg:h-screen w-full overflow-hidden flex items-end pt-20">
            {/* Background Image/Video */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-transparent z-10 lg:from-[#020617]/80" />
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    src={getImageUrl(content.backdrop_path)}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-24">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

                    {/* Mobile Poster (Above Text) */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative w-48 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <img src={getPosterUrl(content.poster_path)} alt={title} className="w-full h-full object-cover" />
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
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    {rating}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {year}
                                </span>
                                <span>•</span>
                                {mediaType === 'movie' ? (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {(content as MovieDetails).runtime}m
                                    </span>
                                ) : (
                                    <span>{(content as TvDetails).number_of_seasons} Seasons</span>
                                )}
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
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
                                    >
                                        <Youtube className="w-6 h-6" />
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onWatchlistToggle}
                                    className={`p-4 rounded-xl border transition-all backdrop-blur-md flex items-center gap-2 font-semibold ${inWatchlist
                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                        }`}
                                    title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
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
                                >
                                    <Share2 className="w-6 h-6" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Desktop Poster (Right Side) */}
                    <div className="hidden lg:block lg:col-span-4 justify-self-end">
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6, type: 'spring', damping: 15 }}
                            className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group cursor-pointer"
                            onClick={onPlay}
                        >
                            <img src={getPosterUrl(content.poster_path)} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#020617] shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                                    <Play className="w-10 h-10 fill-current ml-1" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
