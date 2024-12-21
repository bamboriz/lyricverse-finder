import { supabase } from "@/integrations/supabase/client";

interface Song {
  artist: string;
  title: string;
  lyrics?: string;
  interpretation?: string;
}

export const fetchFromDatabase = async (artist: string, title: string) => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('artist', artist.toLowerCase())
    .eq('title', title.toLowerCase())
    .single();

  if (error) {
    console.error('Error fetching from database:', error);
    return null;
  }

  return data;
};

export const saveToDatabase = async (
  artist: string,
  title: string,
  lyrics: string,
  interpretation?: string
) => {
  const { error } = await supabase.from('songs').upsert(
    {
      artist: artist.toLowerCase(),
      title: title.toLowerCase(),
      lyrics,
      interpretation,
    },
    {
      onConflict: 'artist,title',
    }
  );

  if (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
};

export const fetchLyrics = async ({ artist, title }: { artist: string; title: string }) => {
  // Properly encode the artist and title for the URL
  const encodedArtist = encodeURIComponent(artist);
  const encodedTitle = encodeURIComponent(title);
  
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch lyrics for "${title}" by ${artist}`);
  }

  const data = await response.json();
  return { lyrics: data.lyrics };
};