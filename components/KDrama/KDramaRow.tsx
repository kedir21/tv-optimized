import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ContentItem } from '../../types';
import KDramaCard from './KDramaCard';

interface KDramaRowProps {
  title: string;
  subtitle?: string;
  items: ContentItem[];
  isLoading?: boolean;
  onItemSelect: (item: ContentItem) => void;
  accent?: 'violet' | 'rose' | 'blue';
}

const KDramaRow: React.FC<KDramaRowProps> = ({
  title,
  subtitle,
  items,
  isLoading,
  onItemSelect,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  if (!isLoading && items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/row py-8">
      <div className="flex items-center justify-between mb-8 px-6 md:px-12 lg:px-20">
        <div>
           <div className="flex items-center gap-2 mb-1.5">
             <Sparkles size={14} className="text-rose-500" />
             <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.3em]">Exclusive Collection</span>
           </div>
           <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-wide">
             {title}
           </h2>
           {subtitle && <p className="text-white/30 text-sm mt-1">{subtitle}</p>}
        </div>
        
        <div className="hidden md:flex items-center gap-2">
            <button 
                onClick={() => scroll('left')}
                className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all ${!isScrolled && 'opacity-20 pointer-events-none'}`}
            >
                <ChevronLeft size={20} />
            </button>
            <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div 
        ref={rowRef}
        onScroll={() => setIsScrolled((rowRef.current?.scrollLeft ?? 0) > 20)}
        className="flex gap-6 overflow-x-auto no-scrollbar px-6 md:px-12 lg:px-20 py-2 scroll-smooth"
      >
        {isLoading ? (
            <>
                {[...Array(6)].map((_, i) => (
                   <div key={i} className="flex-shrink-0 w-[40vw] sm:w-[160px] md:w-[200px] lg:w-[240px] aspect-[2/3] rounded-2xl bg-white/5 shimmer" />
                ))}
            </>
        ) : (
            <>
                {items.map((item) => (
                    <KDramaCard
                        key={item.id}
                        item={item}
                        onSelect={onItemSelect}
                    />
                ))}
            </>
        )}
        <div className="w-12 shrink-0 h-1" />
      </div>
    </div>
  );
};

export default KDramaRow;
