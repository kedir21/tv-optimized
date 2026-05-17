import React, { useRef, useState } from 'react';
import { ContentItem } from '../types';
import MovieCard from './MovieCard';
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

  if (isLoading && items.length === 0) return null;
  if (items.length === 0) return null;

  const handleScroll = () => {
    if (rowRef.current) {
      setIsScrolled(rowRef.current.scrollLeft > 0);
    }
  };

  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: -window.innerWidth / 2, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: window.innerWidth / 2, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-10 md:mb-16 pl-4 md:pl-12 group relative">
      {title && (
        <div className="flex items-center gap-3 mb-5 md:mb-7">
          <div className="w-1 h-5 md:h-6 bg-rose-500 rounded-full" />
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
        </div>
      )}
      
      <div className="relative">
        {/* Left Arrow */}
        <button 
          onClick={scrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-40 glass rounded-r-xl p-2 h-20 md:h-28 opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-white/10 ${!isScrolled && 'hidden'}`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white/60 hover:text-white w-5 h-5" />
        </button>

        {/* Right Arrow */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 glass rounded-l-xl p-2 h-20 md:h-28 opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-white/10"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-white/60 hover:text-white w-5 h-5" />
        </button>

        <div 
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar py-4 md:py-6 px-1 scroll-smooth [-webkit-overflow-scrolling:touch] snap-x snap-mandatory relative z-10"
        >
          {items.map((item) => (
            <div key={item.id} className="snap-start scroll-mx-4 md:scroll-mx-12 shrink-0">
              <MovieCard
                movie={item}
                onClick={() => onItemSelect(item)}
              />
            </div>
          ))}
          {/* End spacer */}
          <div className="w-4 md:w-12 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default Row;
