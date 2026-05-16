import React, { useRef, useState } from 'react';
import { ContentItem } from '../types';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight, Flame, Star, Popcorn, List } from 'lucide-react';

interface RowProps {
  title: string;
  items: ContentItem[];
  onItemSelect: (item: ContentItem) => void;
  isLoading?: boolean;
}

const Row: React.FC<RowProps> = ({ title, items, onItemSelect, isLoading = false }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // If loading and no items, show nothing (cleaner than skeleton)
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

  const getTitleIcon = () => {
    const t = title.toLowerCase();
    if (t.includes('trending')) return <Flame className="text-orange-500 w-6 h-6 md:w-8 md:h-8" />;
    if (t.includes('popular')) return <Popcorn className="text-yellow-400 w-6 h-6 md:w-8 md:h-8" />;
    if (t.includes('top rated')) return <Star className="text-cyan-400 w-6 h-6 md:w-8 md:h-8" />;
    if (t.includes('list')) return <List className="text-purple-400 w-6 h-6 md:w-8 md:h-8" />;
    return <div className="w-1.5 h-6 md:h-8 bg-cyan-500 rounded-full" />;
  };

  return (
    <div className="mb-12 md:mb-20 pl-4 md:pl-12 group relative">
      <div className="flex items-center gap-3 mb-6 md:mb-8 ml-[-1rem] md:ml-[-3rem] pl-[1rem] md:pl-[3rem]">
        {getTitleIcon()}
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
          {title}
        </h2>
      </div>
      
      <div className="relative">
        {/* Left Arrow */}
        <button 
          onClick={scrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/60 backdrop-blur-xl hover:bg-black/90 hover:scale-110 hover:text-cyan-400 rounded-r-2xl p-2 md:p-3 h-24 md:h-32 border border-white/10 opacity-0 md:group-hover:opacity-100 transition-all duration-300 ${!isScrolled && 'hidden'}`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white hover:text-cyan-400 w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* Right Arrow */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/60 backdrop-blur-xl hover:bg-black/90 hover:scale-110 hover:text-cyan-400 rounded-l-2xl p-2 md:p-3 h-24 md:h-32 border border-white/10 opacity-0 md:group-hover:opacity-100 transition-all duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-white hover:text-cyan-400 w-6 h-6 md:w-8 md:h-8" />
        </button>

        <div 
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar py-6 md:py-10 px-1 scroll-smooth [-webkit-overflow-scrolling:touch] snap-x snap-mandatory group/list relative z-10"
        >
          {items.map((item) => (
            <div key={item.id} className="snap-start scroll-mx-4 md:scroll-mx-12 shrink-0">
              <MovieCard
                movie={item}
                onClick={() => onItemSelect(item)}
              />
            </div>
          ))}
          {/* Spacer for end of row */}
          <div className="w-4 md:w-12 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default Row;
