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

// Add the missing exported functions
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

  throw new Error(`No lyrics found for "${title}" by ${artist}`);
};