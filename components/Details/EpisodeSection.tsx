import React from 'react';
import { motion } from 'framer-motion';
import { Play, Film, ChevronDown, Star } from 'lucide-react';
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
    <div className="py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h2 className="text-2xl font-bold text-white tracking-tight">Episodes</h2>

        <div className="relative">
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(parseInt(e.target.value, 10))}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-5 pr-12 py-3 text-xs font-bold text-white/70 uppercase tracking-wider focus:outline-none focus:border-rose-500/50 cursor-pointer transition-all min-w-[160px]"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.season_number} className="bg-[#0a0a0f]">
                Season {s.season_number}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {seasonDetails?.episodes?.map((episode, i) => (
          <motion.div
            key={episode.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            onClick={() =>
              navigate(
                `/watch/${content.id}?type=tv&s=${episode.season_number}&e=${episode.episode_number}`
              )
            }
            className="group relative flex flex-col md:flex-row gap-5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="relative w-full md:w-56 aspect-video rounded-xl overflow-hidden shrink-0">
              {episode.still_path ? (
                <img
                  src={getStillUrl(episode.still_path)}
                  alt={episode.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <Film className="w-8 h-8 text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={24} className="text-white fill-current" />
              </div>
            </div>

            <div className="flex-1 py-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">
                  E{episode.episode_number}
                </span>
                {episode.vote_average > 0 && (
                  <div className="flex items-center gap-1 text-white/20 text-[10px] font-bold">
                    <Star size={10} className="fill-current text-amber-500" />
                    {episode.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-rose-500 transition-colors">
                {episode.name}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed line-clamp-2 max-w-3xl">
                {episode.overview || 'No synopsis available.'}
              </p>
            </div>
          </motion.div>
        )) ||
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
      </div>
    </div>
  );
};
