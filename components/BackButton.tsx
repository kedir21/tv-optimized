
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on Player as it has its own controls and immersive mode.
  // Hide on Home page (root path).
  if (location.pathname.startsWith('/watch/') || location.pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900/60 backdrop-blur-2xl border border-white/10 text-white hover:bg-white/20 hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-300 focusable tv-focus shadow-[0_10px_30px_rgba(0,0,0,0.3)] group"
      aria-label="Go Back"
    >
      <ArrowLeft size={18} className="md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
      <span className="font-semibold text-xs md:text-sm tracking-tight">Back</span>
    </button>
  );
};

export default BackButton;
