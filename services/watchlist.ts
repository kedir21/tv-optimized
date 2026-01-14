import { Movie, ContentItem } from '../types';
import { supabase } from '../lib/supabase';
import { authService } from './auth';

const LOCAL_KEY = 'cinestream_guest_watchlist';

// Helper to check if we are online/authenticated
const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

export const watchlistService = {
  getWatchlist: async (): Promise<ContentItem[]> => {
    const isAuth = await isAuthenticated();

    if (isAuth) {
      const { data, error } = await supabase
        .from('watchlist')
        .select('movie_data');
      
      if (error) {
        console.error('Error fetching remote watchlist:', error);
        return [];
      }
      return data.map(item => item.movie_data);
    } else {
      // Fallback to local storage for guests
      try {
        const stored = localStorage.getItem(LOCAL_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
  },
  
  isInWatchlist: async (id: number): Promise<boolean> => {
    const list = await watchlistService.getWatchlist();
    return list.some(m => m.id === id);
  },

  addToWatchlist: async (movie: ContentItem) => {
    const isAuth = await isAuthenticated();
    
    if (isAuth) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const mediaType = 'media_type' in movie ? movie.media_type : 'movie';
      
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          media_type: mediaType || 'movie',
          movie_data: movie
        });

      if (error) console.error('Error adding to remote watchlist:', error);
    } else {
      // Local Guest Logic
      const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      if (!list.some((m: ContentItem) => m.id === movie.id)) {
        list.push(movie);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
      }
    }
    
    window.dispatchEvent(new Event('watchlist-updated'));
  },

  removeFromWatchlist: async (id: number) => {
    const isAuth = await isAuthenticated();

    if (isAuth) {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('movie_id', id);

      if (error) console.error('Error removing from remote watchlist:', error);
    } else {
      // Local Guest Logic
      let list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      list = list.filter((m: ContentItem) => m.id !== id);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    }

    window.dispatchEvent(new Event('watchlist-updated'));
  },

  toggleWatchlist: async (movie: ContentItem) => {
    const inList = await watchlistService.isInWatchlist(movie.id);
    if (inList) {
      await watchlistService.removeFromWatchlist(movie.id);
    } else {
      await watchlistService.addToWatchlist(movie);
    }
  }
};