const VIDVAULT_BASE = 'https://vidvault.ru';

const urlCache = new Map<string, string>();

export function getVidVaultUrl(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  opts?: { season?: number; episode?: number }
): string {
  const season = opts?.season;
  const episode = opts?.episode;
  const cacheKey = `${mediaType}:${tmdbId}:${season ?? ''}:${episode ?? ''}`;
  const cached = urlCache.get(cacheKey);
  if (cached) return cached;

  let url: string;
  if (mediaType === 'movie') {
    url = `${VIDVAULT_BASE}/movie/${tmdbId}`;
  } else if (
    typeof season === 'number' &&
    typeof episode === 'number' &&
    season > 0 &&
    episode > 0
  ) {
    url = `${VIDVAULT_BASE}/tv/${tmdbId}/${season}/${episode}`;
  } else {
    url = `${VIDVAULT_BASE}/tv/${tmdbId}`;
  }

  urlCache.set(cacheKey, url);
  return url;
}
