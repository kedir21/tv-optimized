
import { ContentItem } from '../types';

export const progressService = {
  getContinueWatching: (): ContentItem[] => {
    try {
      const stored = localStorage.getItem('vidLinkProgress');
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      // Convert object to array
      const items = Object.values(data);
      
      // Sort descending by last_updated (newest first)
      items.sort((a: any, b: any) => (b.last_updated || 0) - (a.last_updated || 0));
      
      return items.map((item: any) => {
         // VidLink uses 'show' or 'tv' for TV shows
         const isTv = item.type === 'tv' || item.type === 'show';
         
         // Map to ContentItem interface
         // Providing defaults for fields that might be missing in the progress data
         return {
            id: item.id,
            title: item.title,
            name: item.title, // Map title to name for TV
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            media_type: isTv ? 'tv' : 'movie',
            overview: '', // Progress data might not have overview
            release_date: '',
            first_air_date: '',
            vote_average: 0,
            genre_ids: [],
         } as ContentItem;
      });
    } catch (e) {
      console.error("Error parsing continue watching data", e);
      return [];
    }
  }
};
