import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const getSongByArtistAndTitle = async (
  artist: string,
  title: string
): Promise<Tables<"songs"> | null> => {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("artist", artist)
    .eq("title", title)
    .single();

  if (error) {
    console.error("Error fetching song:", error);
    return null;
  }

  return data;
};

export const incrementSongHits = async (songId: number) => {
  const { error } = await supabase.rpc('increment_song_hits', { song_id: songId });
  
  if (error) {
    console.error("Error incrementing song hits:", error);
  }
};

export const fetchFromDatabase = async (artist: string, title: string) => {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("artist", artist)
    .eq("title", title)
    .single();

  if (error) {
    console.error("Error fetching from database:", error);
    return null;
  }

  return data;
};

export const saveToDatabase = async (
  artist: string,
  title: string,
  lyrics: string,
  interpretation: string | null
) => {
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

const fetchFromOVHApi = async (artist: string, title: string) => {
  const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`No lyrics found for "${title}" by ${artist}`);
    }
    throw new Error('Failed to fetch lyrics from API');
  }
  
  const data = await response.json();
  return data.lyrics;
};

export const fetchLyrics = async ({ 
  artist, 
  title 
}: { 
  artist: string; 
  title: string;
}) => {
  // First try to get from database
  const dbSong = await fetchFromDatabase(artist, title);
  if (dbSong?.lyrics) {
    return { lyrics: dbSong.lyrics };
  }

  // If not in database, fetch from API
  try {
    const lyrics = await fetchFromOVHApi(artist, title);
    return { lyrics };
  } catch (error) {
    console.error('Error fetching lyrics from API:', error);
    throw error;
  }
};