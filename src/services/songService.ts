import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Song = Tables<"songs">;

export const fetchFromDatabase = async (artist: string, title: string): Promise<Song | null> => {
  console.log('Fetching from database - artist:', artist, 'title:', title);
  
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .filter('artist', 'ilike', artist)
    .filter('title', 'ilike', title)
    .maybeSingle();

  if (error) {
    console.error("Error fetching from database:", error);
    return null;
  }

  console.log('Database fetch result:', data);
  return data;
};

export const incrementSongHits = async (songId: number) => {
  const { error } = await supabase.rpc('increment_song_hits', { song_id: songId });
  
  if (error) {
    console.error("Error incrementing song hits:", error);
  }
};

export const saveToDatabase = async (
  artist: string,
  title: string,
  lyrics: string,
  interpretation: string | null
): Promise<Song> => {
  console.log('Saving to database:', { artist, title });
  const { data, error } = await supabase
    .from("songs")
    .upsert(
      {
        artist,
        title,
        lyrics,
        interpretation,
      },
      { onConflict: 'artist,title' }
    )
    .select()
    .single();

  if (error) {
    console.error("Error saving to database:", error);
    throw error;
  }

  return data;
};

export const fetchLyrics = async ({ 
  artist, 
  title 
}: { 
  artist: string; 
  title: string;
}): Promise<{ lyrics: string }> => {
  console.log('Starting lyrics fetch for:', { artist, title });
  // First try to get from database
  const dbSong = await fetchFromDatabase(artist, title);
  if (dbSong?.lyrics) {
    console.log('Found lyrics in database');
    return { lyrics: dbSong.lyrics };
  }

  // If not in database, fetch from API
  try {
    console.log('No lyrics in database, trying API');
    const lyrics = await fetchFromOVHApi(artist, title);
    return { lyrics };
  } catch (error) {
    console.error('Error fetching lyrics from API:', error);
    throw error;
  }
};

const fetchFromOVHApi = async (artist: string, title: string): Promise<string> => {
  console.log('Fetching from OVH API - artist:', artist, 'title:', title);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No lyrics found for "${title}" by ${artist}`);
      }
      throw new Error('Failed to fetch lyrics from API');
    }
    
    const data = await response.json();
    console.log('OVH API response:', data);
    return data.lyrics;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 5 seconds');
    }
    throw error;
  }
};