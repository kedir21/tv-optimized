
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getLogoUrl } from '../services/api';
import { FEATURED_NETWORKS } from '../services/networks';
import { Network } from '../types';

const Networks: React.FC = () => {
  const navigate = useNavigate();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      // Fetch details for all configured featured networks to get their logos
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

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-20 pb-24 md:px-12 md:pt-12 md:pb-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Networks & Studios</h1>
        <p className="text-gray-400 mb-10 text-lg">Browse content from your favorite streaming services and production companies.</p>

        {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
              ))}
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {networks.map((network) => (
              <div 
                key={network.id}
                onClick={() => navigate(`/network/${network.id}`)}
                className="focusable tv-focus group bg-white/5 hover:bg-white rounded-xl p-8 aspect-video flex items-center justify-center cursor-pointer transition-all duration-300 border border-white/5 hover:scale-105 hover:shadow-2xl"
              >
                {network.logo_path ? (
                  <img 
                    src={getLogoUrl(network.logo_path)} 
                    alt={network.name}
                    className="max-w-[80%] max-h-[70%] object-contain filter grayscale group-hover:grayscale-0 brightness-200 group-hover:brightness-100 transition-all duration-300"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-400 group-hover:text-black">{network.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Networks;
