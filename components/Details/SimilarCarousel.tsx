import React from 'react';
import { motion } from 'framer-motion';
import { ContentItem } from '../../types';
import MediaCard from '../MediaCard';

interface SimilarCarouselProps {
  items: ContentItem[];
  mediaType: 'movie' | 'tv';
  onSelect: (item: ContentItem) => void;
}

export const SimilarCarousel: React.FC<SimilarCarouselProps> = ({ items, mediaType, onSelect }) => {
  if (!items.length) return null;

  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Related Content</h2>
      
      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6">
        {items.slice(0, 15).map((item) => (
          <div key={item.id} className="w-40 md:w-48 shrink-0">
            <MediaCard
                item={{ ...item, media_type: item.media_type || mediaType } as ContentItem}
                variant="portrait"
                onClick={() => onSelect({ ...item, media_type: item.media_type || mediaType } as ContentItem)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
