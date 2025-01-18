const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    // First normalize accented characters to their basic latin equivalents
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Then replace any remaining non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove any leading or trailing hyphens
    .replace(/^-+|-+$/g, '');
};

export const generateSlug = (artist: string, title: string) => {
  const normalizedArtist = normalizeText(artist);
  const normalizedTitle = normalizeText(title);
  return `${normalizedArtist}--${normalizedTitle}-lyrics-and-meaning`;
};

export const parseSlugForDirectAccess = (slug: string): { artist: string; title: string } => {
  if (!slug) {
    throw new Error('Invalid URL: no slug provided');
  }

  // Remove the "-lyrics-and-meaning" suffix
  const withoutSuffix = slug.replace(/-lyrics-and-meaning$/, '');
  
  // Split by double hyphen to separate artist and title
  const parts = withoutSuffix.split('--');
  
  if (parts.length !== 2) {
    throw new Error('Invalid URL format: missing artist-title separator');
  }

  // Convert hyphens back to spaces and normalize the text
  const artist = parts[0].replace(/-/g, ' ').trim();
  const title = parts[1].replace(/-/g, ' ').trim();

  if (!artist || !title) {
    throw new Error('Invalid URL format: missing artist or title');
  }

  return { artist, title };
};

export const capitalizeForDisplay = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};