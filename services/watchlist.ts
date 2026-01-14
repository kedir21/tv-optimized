import { Movie } from '../types';
import { authService } from './auth';

const BASE_KEY = 'cinestream_watchlist';

const getStorageKey = () => {
  const user = authService.getCurrentUser();
  return user ? `${BASE_KEY}_${user.id}` : `${BASE_KEY}_guest`;
};

export const watchlistService = {
  getWatchlist: (): Movie[] => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse watchlist", e);
      return [];
    }
  },
  
  isInWatchlist: (id: number): boolean => {
    const list = watchlistService.getWatchlist();
    return list.some(m => m.id === id);
  },

  addToWatchlist: (movie: Movie) => {
    const list = watchlistService.getWatchlist();
    if (!list.some(m => m.id === movie.id)) {
      list.push(movie);
      localStorage.setItem(getStorageKey(), JSON.stringify(list));
      window.dispatchEvent(new Event('watchlist-updated'));
    }
  },

  removeFromWatchlist: (id: number) => {
    let list = watchlistService.getWatchlist();
    list = list.filter(m => m.id !== id);
    localStorage.setItem(getStorageKey(), JSON.stringify(list));
    window.dispatchEvent(new Event('watchlist-updated'));
  },

  toggleWatchlist: (movie: Movie) => {
    if (watchlistService.isInWatchlist(movie.id)) {
      watchlistService.removeFromWatchlist(movie.id);
    } else {
      watchlistService.addToWatchlist(movie);
    }
  }
};