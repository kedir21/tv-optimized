import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on Player as it has its own controls and immersive mode.
  // Hide on Home page (root path).
  if (location.pathname.startsWith('/watch/') || location.pathname === '/') {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-3"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center w-10 h-10 md:w-auto md:px-5 md:py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white shadow-xl hover:bg-white/20 hover:border-white/40 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 group"
        aria-label="Go Back"
      >
        <ArrowLeft size={18} className="md:w-5 md:h-5 md:mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="hidden md:inline font-bold tracking-wide">Back</span>
      </button>

      <button
        onClick={() => navigate('/')}
        className="flex items-center justify-center w-10 h-10 md:w-auto md:px-5 md:py-2.5 rounded-full bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 text-cyan-50 shadow-xl hover:bg-cyan-500/40 hover:border-cyan-500/50 hover:text-white active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 group"
        aria-label="Back to Homepage"
      >
        <Home size={18} className="md:w-5 md:h-5 md:mr-2 group-hover:scale-110 transition-transform duration-300" />
        <span className="hidden md:inline font-bold tracking-wide">Home</span>
      </button>
    </motion.div>
  );
};

export default BackButton;
