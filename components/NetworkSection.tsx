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
    <div className="mb-12 md:mb-20 pl-4 md:pl-12 pr-4 md:pr-12">
      <h2 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 tracking-tighter uppercase pl-1 border-l-4 border-cyan-500 ml-[-1rem] md:ml-[-3rem] pl-[1rem] md:pl-[3rem]">
        Networks & Studios
      </h2>
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6" aria-label="Network links">
        {networks.map((network) => (
          <div
            key={network.id}
            onClick={() => navigate(`/network/${network.id}`)}
            className="focusable tv-focus group bg-white/5 hover:bg-white rounded-2xl p-6 aspect-video flex items-center justify-center cursor-pointer transition-all duration-500 border border-white/5 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(6,182,212,0.15)] overflow-hidden relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/network/${network.id}`)}
            aria-label={`View content from ${network.name}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {network.logo_path ? (
              <img
                src={getLogoUrl(network.logo_path)}
                alt={`${network.name} logo`}
                className="max-w-[80%] max-h-[70%] object-contain filter grayscale group-hover:grayscale-0 brightness-200 group-hover:brightness-100 transition-all duration-500 group-hover:scale-110 relative z-10"
                loading="lazy"
              />
            ) : (
              <span className="text-sm md:text-base font-bold text-gray-400 group-hover:text-[#020617] text-center px-2 relative z-10">{network.name}</span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};
