
import { Movie, TvShow, MovieDetails, TvDetails, Genre, ContentItem, SeasonDetails, Network } from '../types';

// Using a more reliable public demo key for TMDB
const API_KEY: string = '3fd2be6f0c70a2a598f084ddfb75487c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getImageUrl = (path: string | null | undefined) => 
  path ? `${IMAGE_BASE_URL}${path}` : 'https://picsum.photos/1920/1080';

export const getPosterUrl = (path: string | null | undefined) => 
  path ? `${POSTER_BASE_URL}${path}` : 'https://picsum.photos/500/750';

export const getStillUrl = (path: string | null | undefined) => 
  path ? `${IMAGE_BASE_URL}${path}` : 'https://picsum.photos/300/169';

// Helper to get logo URL (using w500 for logos is usually enough)
export const getLogoUrl = (path: string | null | undefined) => 
  path ? `https://image.tmdb.org/t/p/w500${path}` : '';

interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
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

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
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
