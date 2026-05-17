import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, ShieldCheck } from 'lucide-react';

const AdblockWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem('kkflix_adblock_dismissed') === 'true'
  );

  useEffect(() => {
    if (isDismissed) return;

    const checkAdblocker = async () => {
      try {
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors'
        });
        setShowWarning(true);
      } catch (e) {
        setShowWarning(false);
      }
    };

    const timer = setTimeout(() => checkAdblocker(), 3000);
    return () => clearTimeout(timer);
  }, [isDismissed]);

  const handleDismiss = () => {
    setShowWarning(false);
    setIsDismissed(true);
    localStorage.setItem('kkflix_adblock_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-80 z-[100]"
        >
          <div className="relative overflow-hidden glass-strong rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              
              <div className="space-y-2.5 pr-4">
                <h3 className="text-sm font-bold text-white">
                  No Adblocker Detected
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  For the best experience, install <strong className="text-white/70">uBlock Origin</strong> or use a browser with built-in ad blocking.
                </p>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://ublockorigin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold rounded-lg transition-colors active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Get uBlock
                  </a>
                  <button
                    onClick={handleDismiss}
                    className="flex items-center px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-xs font-medium rounded-lg transition-colors border border-white/[0.04] active:scale-95"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdblockWarning;
