const normalizeText = (text: string): string => {
  if (!text) return '';
  
  // Convert to lowercase first
  const lowercased = text.toLowerCase();
  
  // Create a mapping of accented characters and special characters to their normalized equivalents
  const characterMap: { [key: string]: string } = {
    // Accented characters
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
    'ç': 'c',
    // Special characters
    ''': '',    // Right single quote
    ''': '',    // Left single quote
    '\'': '',   // Standard apostrophe
    '"': '',    // Double quote
    '"': '',    // Right double quote
    '"': '',    // Left double quote
  };
  
  // Replace special characters with their normalized equivalents
  const normalized = lowercased.split('').map(char => characterMap[char] || char).join('');
  
  // Replace any remaining non-alphanumeric characters with hyphens
  const withHyphens = normalized.replace(/[^a-z0-9]+/g, '-');
  
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