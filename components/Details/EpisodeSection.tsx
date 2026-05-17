import React from 'react';
import { motion } from 'framer-motion';
import { Play, Film, ChevronDown, LayoutGrid } from 'lucide-react';
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="mb-16 md:mb-24"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <LayoutGrid className="w-5 h-5 text-violet-300" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Episodes</h2>
        </div>
        <motion.div className="relative">
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(parseInt(e.target.value, 10))}
            className="appearance-none glass rounded-xl px-5 pr-10 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 cursor-pointer hover:bg-white/[0.06] transition-colors"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.season_number} className="bg-[var(--bg-card)]">
                Season {s.season_number}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        </motion.div>
      </div>

      <div className="grid gap-3 md:gap-4">
        {seasonDetails?.episodes?.map((episode, i) => (
          <motion.article
            key={episode.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            onClick={() =>
              navigate(
                `/watch/${content.id}?type=tv&s=${episode.season_number}&e=${episode.episode_number}`
              )
            }
            className="group glass rounded-2xl overflow-hidden flex flex-col sm:flex-row cursor-pointer border border-white/[0.04] hover:border-violet-400/25 hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)] transition-all duration-300"
          >
            <div className="relative w-full sm:w-56 md:w-64 aspect-video flex-shrink-0 overflow-hidden">
              {episode.still_path ? (
                <img
                  src={getStillUrl(episode.still_path)}
                  alt={episode.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center">
                  <Film className="w-10 h-10 text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--bg-primary)] shadow-xl">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
              {episode.runtime ? (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-[11px] font-medium text-white/80">
                  {episode.runtime}m
                </span>
              ) : null}
              {/* Progress placeholder — wired when progress API exposes episode % */}
              <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                <motion.div className="h-full w-0 bg-violet-500 group-hover:w-1/4 transition-all duration-700" />
              </motion.div>
            </div>
            <div className="p-4 md:p-5 flex flex-col justify-center min-w-0 flex-1">
              <span className="text-violet-400/80 text-xs font-bold uppercase tracking-wider mb-1">
                E{episode.episode_number}
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-100 transition-colors line-clamp-1 mb-1.5">
                {episode.name}
              </h3>
              <p className="text-white/40 text-sm line-clamp-2 leading-relaxed">
                {episode.overview || 'No summary available.'}
              </p>
            </div>
          </motion.article>
        )) ||
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl shimmer" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
      </div>
    </motion.section>
  );
};
