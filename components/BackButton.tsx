import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith('/watch/') || location.pathname === '/') {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-4 right-4 md:top-5 md:right-6 mt-[env(safe-area-inset-top)] z-50 flex items-center gap-2"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2.5 rounded-xl glass text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 group"
        aria-label="Go Back"
      >
        <ArrowLeft size={16} className="md:mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
        <span className="hidden md:inline text-sm font-medium">Back</span>
      </button>

      <button
        onClick={() => navigate('/')}
        className="flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2.5 rounded-xl glass text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 group"
        aria-label="Back to Homepage"
      >
        <Home size={16} className="md:mr-2 group-hover:scale-105 transition-transform duration-200" />
        <span className="hidden md:inline text-sm font-medium">Home</span>
      </button>
    </motion.div>
  );
};

export default BackButton;
