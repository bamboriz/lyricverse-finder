const normalizeText = (text: string): string => {
  if (!text) return '';
  
  // Convert to lowercase first
  const lowercased = text.toLowerCase();
  
  // Create a mapping of accented characters to their non-accented equivalents
  const accentMap: { [key: string]: string } = {
    'é': 'e',
    'è': 'e',
    'ê': 'e',
    'ë': 'e',
    'à': 'a',
    'â': 'a',
    'ä': 'a',
    'î': 'i',
    'ï': 'i',
    'ô': 'o',
    'ö': 'o',
    'ù': 'u',
    'û': 'u',
    'ü': 'u',
    'ÿ': 'y',
    'ñ': 'n',
    'ç': 'c'
  };
  
  // Replace accented characters with their non-accented equivalents
  const withoutAccents = lowercased.split('').map(char => accentMap[char] || char).join('');
  
  // Replace any remaining non-alphanumeric characters with hyphens
  const withHyphens = withoutAccents.replace(/[^a-z0-9]+/g, '-');
  
  // Remove leading and trailing hyphens
  return withHyphens.replace(/^-+|-+$/g, '');
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

  // Convert hyphens back to spaces and handle special cases
  const artist = parts[0].replace(/-ll-/g, "'ll").replace(/-/g, ' ').trim();
  const title = parts[1].replace(/-ll-/g, "'ll").replace(/-/g, ' ').trim();

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