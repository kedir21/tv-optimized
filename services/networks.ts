
// Hybrid Mapping: 
// - Streamers (Netflix, Disney+) map to Watch Providers (showing content *on* the platform).
// - Traditional Networks (NBC, HBO) map to Production Companies (showing content *produced by* them).

export const NETWORK_MOVIE_MAPPING: Record<number, { type: 'company' | 'provider', value: number }> = {
    // Streamers -> Watch Providers
    213: { type: 'provider', value: 8 },      // Netflix
    1024: { type: 'provider', value: 9 },     // Amazon Prime Video
    2739: { type: 'provider', value: 337 },   // Disney+
    2552: { type: 'provider', value: 350 },   // Apple TV+
    453: { type: 'provider', value: 15 },     // Hulu
    3353: { type: 'provider', value: 386 },   // Peacock
    
    // Traditional Networks -> Production Companies
    49: { type: 'company', value: 10076 },    // HBO -> HBO Films
    67: { type: 'company', value: 13980 },    // Showtime
    4: { type: 'company', value: 288 },       // BBC -> BBC Films
    174: { type: 'company', value: 104 },     // AMC Networks
    71: { type: 'company', value: 1957 },     // The CW -> Warner Bros Television
    19: { type: 'company', value: 56 },       // FOX -> Amblin/20th Century (Approx)
    6: { type: 'company', value: 1506 },      // NBC -> NBCUniversal
    2: { type: 'company', value: 1583 },      // ABC -> ABC Studios
    16: { type: 'company', value: 18 },       // CBS -> CBS
};

// Deprecated simple mapping, kept for backward compat if needed, but we should migrate.
export const NETWORK_MAPPING: Record<number, number> = {
    // This is largely replaced by NETWORK_MOVIE_MAPPING logic in NetworkDetails.tsx
};

export const FEATURED_NETWORKS = [
    { id: 213, name: 'Netflix' },
    { id: 49, name: 'HBO' },
    { id: 1024, name: 'Amazon Prime' },
    { id: 2739, name: 'Disney+' },
    { id: 2552, name: 'Apple TV+' },
    { id: 453, name: 'Hulu' },
    { id: 67, name: 'Showtime' },
    { id: 174, name: 'AMC' },
    { id: 4, name: 'BBC' },
    { id: 71, name: 'The CW' },
    { id: 6, name: 'NBC' },
    { id: 2, name: 'ABC' }
];
