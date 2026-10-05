export const TMDB_IMAGE_BASE =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

export function getTmdbImageUrl(
  path: string | null | undefined,
  size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500',
): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=60';
  }
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(
  path: string | null | undefined,
  size: 'w780' | 'w1280' | 'original' = 'w1280',
): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80';
  }
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const LANGUAGE_OPTIONS = [
  { code: '', name: 'All Languages', label: 'All Industries (Worldwide)', flag: '🌍' },
  { code: 'hi', name: 'Hindi', label: 'Bollywood (Hindi)', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', label: 'Tollywood (Telugu)', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', label: 'Kollywood (Tamil)', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', label: 'Mollywood (Malayalam)', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', label: 'Sandalwood (Kannada)', flag: '🇮🇳' },
  { code: 'en', name: 'English', label: 'Hollywood / English', flag: '🇺🇸' },
  { code: 'ko', name: 'Korean', label: 'Korean Cinema', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', label: 'Anime & Japanese', flag: '🇯🇵' },
  { code: 'es', name: 'Spanish', label: 'Spanish Cinema', flag: '🇪🇸' },
  { code: 'fr', name: 'French', label: 'French Cinema', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', label: 'Italian Cinema', flag: '🇮🇹' },
  { code: 'de', name: 'German', label: 'German Cinema', flag: '🇩🇪' },
];

export const QUICK_PROMPTS = [
  'Best Bollywood inspirational movies like 3 Idiots, Dangal, and Swades',
  'Epic South Indian action spectacle like RRR, Baahubali, and KGF',
  'Gripping Korean thriller like Parasite or Memories of Murder',
  'Emotional anime masterpiece similar to Spirited Away and Your Name',
  'Mind-bending sci-fi thriller like Inception or Interstellar with huge twists',
  'Feel-good adventure comedy for a cozy movie night with friends',
];

