
import React from 'react';
import { ContentItem } from '../types';
import MovieCard from './MovieCard';

interface RowProps {
  title: string;
  items: ContentItem[];
  onItemSelect: (item: ContentItem) => void;
  isLoading?: boolean;
}

const Row: React.FC<RowProps> = ({ title, items, onItemSelect, isLoading = false }) => {
  // If loading and no items, show nothing (cleaner than skeleton)
  if (isLoading && items.length === 0) return null;
  if (items.length === 0) return null;

  return (
    <div className="mb-12 md:mb-20 pl-4 md:pl-12">
      <h2 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 tracking-tighter uppercase pl-1 border-l-4 border-cyan-500 ml-[-1rem] md:ml-[-3rem] pl-[1rem] md:pl-[3rem]">
        {title}
      </h2>
      <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar py-4 px-1 scroll-smooth">
        {items.map((item) => (
          <MovieCard
            key={item.id}
            movie={item}
            onClick={() => onItemSelect(item)}
          />
        ))}
        {/* Spacer for end of row */}
        <div className="w-4 md:w-12 flex-shrink-0" />
      </div>
    </div>
  );
};

export default Row;
