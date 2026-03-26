import { ContentItem } from '../types';

type MediaType = 'movie' | 'tv';

const buildDetailsHash = (type: MediaType, id: number | string) => `#/details/${type}/${id}`;

export const openDetailsInNewTab = (type: MediaType, id: number | string) => {
  const { origin, pathname, search } = window.location;

  // HashRouter needs the `#/...` portion; we also include origin/path so the new tab resolves correctly.
  const base =
    origin && origin !== 'null'
      ? `${origin}${pathname}${search}`
      : `${pathname}${search}`;

  const url = `${base}${buildDetailsHash(type, id)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const openDetailsInNewTabForItem = (item: ContentItem) => {
  const type = (item.media_type || 'movie') as MediaType;
  openDetailsInNewTab(type, item.id);
};

