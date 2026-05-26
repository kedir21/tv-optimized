import React, { useRef, useState } from 'react';
import { ContentItem } from '../types';
import MediaCard from './MediaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RowProps {
  title: string;
  items: ContentItem[];
  onItemSelect: (item: ContentItem) => void;
  isLoading?: boolean;
}

const Row: React.FC<RowProps> = ({ title, items, onItemSelect, isLoading = false }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  if (!isLoading && items.length === 0) return null;

  const handleScroll = () => {
    if (rowRef.current) {
      setIsScrolled(rowRef.current.scrollLeft > 0);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/row py-6">
      <div className="flex items-center justify-between mb-6 px-6 md:px-12 lg:px-20">
        <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-wide">
          {title}
        </h2>
        <div className="hidden md:flex items-center gap-2">
            <button 
                onClick={() => scroll('left')}
                className={`w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all ${!isScrolled && 'opacity-20 pointer-events-none'}`}
            >
                <ChevronLeft size={18} />
            </button>
            <button 
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
                <ChevronRight size={18} />
            </button>
        </div>
      </div>

      <div 
        ref={rowRef}
        onScroll={handleScroll}
        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar px-6 md:px-12 lg:px-20 py-2"
      >
        {isLoading ? (
            <>
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i} 
                        className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[230px] aspect-[2/3] rounded-2xl bg-white/5 shimmer border border-white/5" 
                    />
                ))}
            </>
        ) : (
            <>
                {items.map((item) => (
                    <MediaCard
                        key={item.id}
                        item={item}
                        variant="portrait"
                        onClick={() => onItemSelect(item)}
                    />
                ))}
            </>
        )}
        {/* End spacer */}
        <div className="w-12 shrink-0 h-1" />
      </div>
    </div>
  );
};

export default Row;
