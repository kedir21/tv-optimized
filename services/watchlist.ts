
import { ContentItem } from '../types';
import { supabase } from '../lib/supabase';

const LOCAL_KEY = 'cinestream_guest_watchlist';

// Cache structure to store watchlist in memory
interface WatchlistCache {
    userId: string; // 'guest' or uuid
    items: ContentItem[];
}

// Module-level cache singleton
let cache: WatchlistCache | null = null;
let fetchPromise: Promise<ContentItem[]> | null = null;

// Helper to strip heavy data from ContentItem before saving
const sanitizeItem = (item: any): ContentItem => {
  return {
    id: item.id,
    title: item.title || item.name,
    name: item.name || item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview,
    vote_average: item.vote_average,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    media_type: item.media_type || 'movie',
    genre_ids: item.genre_ids || [],
  } as ContentItem;
};

export const watchlistService = {
  getWatchlist: async (): Promise<ContentItem[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || 'guest';

    // 1. Return cached data if valid for the current user
    if (cache && cache.userId === currentUserId) {
        return cache.items;
    }

    // 2. Handle Guest Mode (Local Storage)
    if (currentUserId === 'guest') {
        try {
            const stored = localStorage.getItem(LOCAL_KEY);
            const items = stored ? JSON.parse(stored) : [];
            cache = { userId: 'guest', items };
            return items;
        } catch (e) {
            return [];
        }
    }

    // 3. Handle Authenticated Mode (Supabase)
    // Prevent multiple simultaneous requests (N+1 problem)
    if (fetchPromise) return fetchPromise;

    fetchPromise = (async () => {
        const { data, error } = await supabase
            .from('watchlist')
            .select('movie_data')
            .order('created_at', { ascending: false }); // Latest added first
        
        fetchPromise = null;

        if (error) {
            console.error('Error fetching remote watchlist:', error);
            return [];
        }

        const list = data ? data.map(item => item.movie_data) : [];
        cache = { userId: currentUserId, items: list };
        return list;
    })();

    return fetchPromise;
  },
  
  isInWatchlist: async (id: number): Promise<boolean> => {
    // Optimistic check against cache if available (instant result)
    if (cache) {
        return cache.items.some(m => m.id === id);
    }
    // Fallback to loading the list
    const list = await watchlistService.getWatchlist();
    return list.some(m => m.id === id);
  },

  addToWatchlist: async (movie: ContentItem) => {
    // Ensure cache is populated
    await watchlistService.getWatchlist();
    if (!cache) return; 

    // Avoid duplicates
    if (cache.items.some(m => m.id === movie.id)) return;

    const sanitizedMovie = sanitizeItem(movie);
    
    // 1. Optimistic Update (Immediate Feedback)
    const newItems = [sanitizedMovie, ...cache.items];
    cache.items = newItems;
    
    // 2. Notify Listeners Immediately
    window.dispatchEvent(new Event('watchlist-updated'));

    // 3. Persist in Background
    if (cache.userId === 'guest') {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(newItems));
    } else {
        const mediaType = 'media_type' in movie ? movie.media_type : 'movie';
        
        // Fire and forget - UI is already updated
        const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: cache.userId,
          movie_id: movie.id,
          media_type: mediaType || 'movie',
          movie_data: sanitizedMovie
        });

        if (error) {
             console.error('Error adding to remote watchlist:', error);
             // In a production app, you might rollback state here or show a toast
        }
    }
  },

  removeFromWatchlist: async (id: number) => {
    await watchlistService.getWatchlist();
    if (!cache) return;

    // Check if exists
    if (!cache.items.some(m => m.id === id)) return;

    // 1. Optimistic Update
    const newItems = cache.items.filter(m => m.id !== id);
    cache.items = newItems;

    // 2. Notify Listeners Immediately
    window.dispatchEvent(new Event('watchlist-updated'));

    // 3. Persist in Background
    if (cache.userId === 'guest') {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(newItems));
    } else {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('movie_id', id);

      if (error) console.error('Error removing from remote watchlist:', error);
    }
  },

  toggleWatchlist: async (movie: ContentItem) => {
    // Using the cache makes this check instant
    const inList = await watchlistService.isInWatchlist(movie.id);
    if (inList) {
      await watchlistService.removeFromWatchlist(movie.id);
    } else {
      await watchlistService.addToWatchlist(movie);
    }
  }
};
