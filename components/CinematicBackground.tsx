import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getImageUrl } from '../services/api';

interface CinematicBackgroundProps {
  heroBackdropPath?: string | null;
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({ heroBackdropPath }) => {
  const { scrollY } = useScroll();
  
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.1]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#040406]">
      {/* Dynamic Mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rose-950/20 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/20 blur-[120px]" />
      </div>

      {/* Hero Backdrop Blend */}
      {heroBackdropPath && (
        <motion.div 
          style={{ y, opacity, scale }}
          className="absolute inset-0 z-10"
        >
          <img
            src={getImageUrl(heroBackdropPath, 'original')}
            alt=""
            className="w-full h-full object-cover opacity-50 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-[#040406]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#040406]/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      )}

      {/* Grain / Noise for cinematic feel */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Global Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,#040406_85%)]" />
    </div>
  );
};

export default CinematicBackground;
