import React from 'react';
import { motion } from 'framer-motion';
import { Play, Film, ChevronDown, ListVideo, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SeasonDetails, TvDetails } from '../../types';
import { getStillUrl } from '../../services/api';

interface EpisodeSectionProps {
  content: TvDetails;
  seasonDetails: SeasonDetails | null;
  selectedSeason: number;
  onSeasonChange: (n: number) => void;
}

export const EpisodeSection: React.FC<EpisodeSectionProps> = ({
  content,
  seasonDetails,
  selectedSeason,
  onSeasonChange,
}) => {
  const navigate = useNavigate();
  const seasons = content.seasons?.filter((s) => s.season_number > 0) ?? [];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter uppercase">Episode Deck</h2>
          </div>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] ml-5">Transmission Logs Available</p>
        </div>

        <div className="relative group">
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(parseInt(e.target.value, 10))}
            className="appearance-none bg-white/5 border border-white/10 rounded-2xl px-8 pr-16 py-4 text-xs font-black text-white uppercase tracking-widest focus:outline-none focus:border-rose-500/50 cursor-pointer hover:bg-white/10 transition-all backdrop-blur-3xl min-w-[200px]"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.season_number} className="bg-[#0a0a0f]">
                Season {s.season_number}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-rose-500 transition-colors pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {seasonDetails?.episodes?.map((episode, i) => (
          <motion.div
            key={episode.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            onClick={() =>
              navigate(
                `/watch/${content.id}?type=tv&s=${episode.season_number}&e=${episode.episode_number}`
              )
            }
            className="group relative flex flex-col lg:flex-row gap-6 p-4 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-rose-500/20 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl"
          >
            {/* Episode Image */}
            <div className="relative w-full lg:w-80 aspect-video rounded-2xl overflow-hidden shadow-xl shrink-0">
              {episode.still_path ? (
                <img
                  src={getStillUrl(episode.still_path)}
                  alt={episode.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <Film className="w-12 h-12 text-white/5" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-16 h-16 rounded-3xl bg-rose-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(225,29,72,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <Play className="w-6 h-6 fill-current" />
                </div>
              </div>

              {episode.runtime && (
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/80">
                  {episode.runtime} MIN
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 py-2 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  Episode {episode.episode_number}
                </span>
                {episode.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black">
                    <Star size={12} className="fill-current" />
                    {episode.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-3 group-hover:text-rose-500 transition-colors tracking-tight">
                {episode.name}
              </h3>
              <p className="text-white/40 text-sm md:text-base leading-relaxed line-clamp-2 max-w-4xl font-medium">
                {episode.overview || 'Synopsis encrypted or unavailable.'}
              </p>
            </div>

            {/* Hover Tech Pattern */}
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-rose-500/[0.03] to-transparent pointer-none" />
          </motion.div>
        )) ||
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-[32px] bg-white/5 animate-pulse" />
          ))}
      </div>
    </motion.section>
  );
};
