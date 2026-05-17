import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ContentItem } from '../../types';
import { api } from '../../services/api';
import KDramaRow from './KDramaRow';

const KD_GENRES = {
  romance: 18,
  action: 10759,
  thriller: 9648,
} as const;

interface KDramaSectionProps {
  onItemSelect: (item: ContentItem) => void;
}

const KDramaSection: React.FC<KDramaSectionProps> = ({ onItemSelect }) => {
  const [data, setData] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [trending, popular, topRated, romance, action, thriller] = await Promise.all([
          api.getTrendingKDramas(),
          api.getPopularKoreanSeries(),
          api.getTopRatedKDramas(),
          api.getKDramaByGenre(KD_GENRES.romance),
          api.getKDramaByGenre(KD_GENRES.action),
          api.getKDramaByGenre(KD_GENRES.thriller),
        ]);
        setData({ trending, popular, topRated, romance, action, thriller });
      } catch (e) {
        console.error('K-Drama fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-20 pt-12"
    >
      <div className="px-6 md:px-12 lg:px-20 mb-12">
        <div className="relative overflow-hidden rounded-[32px] bg-white/5 border border-white/10 p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-rose-500/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-[0.4em] mb-4 block">K-Flix Special</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-[0.95] tracking-tight">
              K-Drama Universe
            </h2>
            <p className="text-lg md:text-xl text-white/40 leading-relaxed max-w-2xl">
              Immerse yourself in the world of high-quality Korean storytelling. From heart-pounding action to soulful romance.
            </p>
          </div>
        </div>
      </div>

      <KDramaRow
        title="Trending Hits"
        subtitle="The most watched series right now"
        items={data.trending || []}
        isLoading={loading}
        onItemSelect={onItemSelect}
      />

      <KDramaRow
        title="Romance & Soul"
        subtitle="Heart-melting love stories"
        items={data.romance || []}
        isLoading={loading}
        onItemSelect={onItemSelect}
      />

      <KDramaRow
        title="Action Thrillers"
        subtitle="High-stakes Korean suspense"
        items={data.action || []}
        isLoading={loading}
        onItemSelect={onItemSelect}
      />

      <KDramaRow
        title="All-Time Classics"
        subtitle="Legendary series you can't miss"
        items={data.topRated || []}
        isLoading={loading}
        onItemSelect={onItemSelect}
      />
    </motion.div>
  );
};

export default KDramaSection;
