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
    <div className="py-8 px-6 md:px-12 lg:px-20">
      <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-6 tracking-wide">
        Networks & Studios
      </h2>
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {networks.map((network) => (
          <div
            key={network.id}
            onClick={() => navigate(`/network/${network.id}`)}
            className="group relative rounded-2xl p-6 aspect-video flex items-center justify-center cursor-pointer transition-all duration-400 bg-white shadow-2xl overflow-hidden hover:scale-105 active:scale-95"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/network/${network.id}`)}
          >
            {network.logo_path ? (
              <img
                src={getLogoUrl(network.logo_path)}
                alt={network.name}
                className="max-w-[80%] max-h-[70%] object-contain transition-all duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-bold text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">{network.name}</span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};
