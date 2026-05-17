import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getLogoUrl } from '../services/api';
import { FEATURED_NETWORKS } from '../services/networks';
import { Network } from '../types';

export const NetworkSection: React.FC = () => {
  const navigate = useNavigate();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const promises = FEATURED_NETWORKS.map(n => api.getNetwork(n.id));
        const results = await Promise.all(promises);
        setNetworks(results);
      } catch (error) {
        console.error("Failed to load networks", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworks();
  }, []);

  if (loading && networks.length === 0) return null;
  if (networks.length === 0) return null;

  return (
    <div className="mb-10 md:mb-16 px-4 md:px-12">
      <div className="flex items-center gap-3 mb-5 md:mb-7">
        <div className="w-1 h-5 md:h-6 bg-rose-500 rounded-full" />
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
          Networks & Studios
        </h2>
      </div>
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4" aria-label="Network links">
        {networks.map((network) => (
          <div
            key={network.id}
            onClick={() => navigate(`/network/${network.id}`)}
            className="focusable tv-focus group rounded-xl md:rounded-2xl p-5 md:p-6 aspect-video flex items-center justify-center cursor-pointer transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] overflow-hidden relative"
            style={{ backgroundColor: 'var(--bg-card)' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/network/${network.id}`)}
            aria-label={`View content from ${network.name}`}
          >
            {network.logo_path ? (
              <img
                src={getLogoUrl(network.logo_path)}
                alt={`${network.name} logo`}
                className="max-w-[75%] max-h-[60%] object-contain filter brightness-200 opacity-40 group-hover:opacity-80 group-hover:brightness-100 transition-all duration-400 group-hover:scale-105 relative z-10"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-medium text-white/30 group-hover:text-white/60 text-center px-2 relative z-10 transition-colors duration-300">{network.name}</span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};
