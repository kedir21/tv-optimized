
import { Movie, TvShow, MovieDetails, TvDetails, Genre, ContentItem, SeasonDetails, Network } from '../types';

// Using a more reliable public demo key for TMDB
const API_KEY: string = '3fd2be6f0c70a2a598f084ddfb75487c';
const BASE_URL = 'https://api.themoviedb.org/3';

// Optimized Image Sizes for better performance
// Original was too large (5MB+), w1280 is sufficient for standard HD/4K TV UI backdrops
const BACKDROP_SIZE = 'w1280'; 
const POSTER_SIZE = 'w500';
const STILL_SIZE = 'w780'; 
const PROFILE_SIZE = 'w185';

const IMAGE_BASE_URL = `https://image.tmdb.org/t/p/${BACKDROP_SIZE}`;
const POSTER_BASE_URL = `https://image.tmdb.org/t/p/${POSTER_SIZE}`;
const STILL_BASE_URL = `https://image.tmdb.org/t/p/${STILL_SIZE}`;

export const getImageUrl = (path: string | null | undefined) => 
  path ? `${IMAGE_BASE_URL}${path}` : 'https://picsum.photos/1920/1080';

export const getPosterUrl = (path: string | null | undefined) => 
  path ? `${POSTER_BASE_URL}${path}` : 'https://picsum.photos/500/750';

export const getStillUrl = (path: string | null | undefined) => 
  path ? `${STILL_BASE_URL}${path}` : 'https://picsum.photos/300/169';

// Helper to get logo URL (using w500 for logos is usually enough)
export const getLogoUrl = (path: string | null | undefined) => 
  path ? `https://image.tmdb.org/t/p/w500${path}` : '';

interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Persistent Cache Configuration
const CACHE_PREFIX = 'tmdb_cache_v1_';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes persistence

// Helper to read from LocalStorage safely
const getCache = (key: string) => {
    try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return parsed.data;
    } catch { 
        return null; 
    }
};

// Helper to write to LocalStorage with quota handling
const setCache = (key: string, data: any) => {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
            timestamp: Date.now(),
            data
        }));
    } catch (e) {
        // If quota exceeded, clear old cache entries to make space
        try {
            console.warn("Cache quota exceeded, cleaning up...");
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
            });
            // Try setting again after cleanup
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        } catch (err) {
            console.warn("Could not save to cache", err);
        }
    }
}

const fetchFromTMDB = async <T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> => {
  const queryParams = new URLSearchParams();
  queryParams.append('api_key', API_KEY);
  queryParams.append('language', 'en-US');

  Object.entries(params).forEach(([key, value]) => {
    // Filter out empty values or "0" for IDs where 0 isn't valid
    if (value !== undefined && value !== null && value !== '' && value !== 0 && value !== 'ALL') {
        queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const cacheKey = `${endpoint}?${queryString}`;

  // Check Cache
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData as T;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Set Cache
    setCache(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
};

export const api = {
  getTrending: async (): Promise<Movie[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/trending/movie/week');
    return res.results.map(m => ({ ...m, media_type: 'movie' }));
  },
  
  getPopular: async (): Promise<Movie[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/movie/popular');
    return res.results.map(m => ({ ...m, media_type: 'movie' }));
  },
  
  getTopRated: async (): Promise<Movie[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/movie/top_rated');
    return res.results.map(m => ({ ...m, media_type: 'movie' }));
  },

  // Details
  getDetails: async (id: string, type: 'movie' | 'tv' = 'movie'): Promise<MovieDetails | TvDetails> => {
    const endpoint = `/${type}/${id}`;
    return await fetchFromTMDB<MovieDetails | TvDetails>(endpoint, { append_to_response: 'videos,credits' });
  },

  // Recommendations
  getRecommendations: async (id: number, type: 'movie' | 'tv'): Promise<ContentItem[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<ContentItem>>(`/${type}/${id}/recommendations`);
    return res.results.map(item => ({ ...item, media_type: type } as ContentItem));
  },
  
  // Season Details (Episodes)
  getSeasonDetails: async (tvId: number, seasonNumber: number): Promise<SeasonDetails> => {
    return await fetchFromTMDB<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
  },

  // Genres
  getGenres: async (type: 'movie' | 'tv'): Promise<Genre[]> => {
    const res = await fetchFromTMDB<{ genres: Genre[] }>(`/genre/${type}/list`);
    return res.genres;
  },

  // Discover
  // Updated signature to support options object for cleaner advanced filtering
  discoverMovies: async (
    page: number, 
    genreId?: number, 
    sortBy: string = 'popularity.desc', 
    options?: { companyId?: number, providerId?: number, country?: string }
  ): Promise<Movie[]> => {
    const params: Record<string, string | number> = { page, sort_by: sortBy };
    
    if (genreId && genreId !== 0) params.with_genres = genreId;
    
    // Handle Advanced Filters
    if (options?.providerId) {
        // Filter by Streaming Provider (Netflix, Disney+, etc)
        params.with_watch_providers = options.providerId;
        // When using watch_providers, watch_region is important. Default to US if not specified.
        params.watch_region = (options.country && options.country !== 'ALL') ? options.country : 'US'; 
    } else if (options?.companyId) {
        // Filter by Production Company (HBO Films, etc)
        params.with_companies = options.companyId;
        // If country is specified with company, we use it as release region to refine results
        if (options.country && options.country !== 'ALL') {
             params.region = options.country;
        }
    } else if (options?.country && options.country !== 'ALL') {
        // Fallback: just filter by region/country if no company/provider
        params.region = options.country;
    }
    
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/discover/movie', params);
    return res.results.map(m => ({ ...m, media_type: 'movie' }));
  },

  discoverTvShows: async (page: number, genreId?: number, sortBy: string = 'popularity.desc', networkId?: number, country?: string): Promise<TvShow[]> => {
    const params: Record<string, string | number> = { page, sort_by: sortBy };
    if (genreId && genreId !== 0) params.with_genres = genreId;
    if (networkId) params.with_networks = networkId;
    if (country && country !== 'ALL') params.with_origin_country = country;

    const res = await fetchFromTMDB<PaginatedResponse<TvShow>>('/discover/tv', params);
    return res.results.map(s => ({ ...s, media_type: 'tv' }));
  },

  // Network Details
  getNetwork: async (id: number): Promise<Network> => {
    return await fetchFromTMDB<Network>(`/network/${id}`);
  },

  // Search (Infinite Scroll)
  searchMulti: async (query: string, page: number = 1): Promise<ContentItem[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<ContentItem>>('/search/multi', { query, page });
    return res.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  },

  // Fallback old search method if needed
  search: async (query: string): Promise<Movie[]> => {
    const res = await fetchFromTMDB<PaginatedResponse<Movie>>('/search/movie', { query });
    return res.results;
  }
};
