import { supabase } from "@/integrations/supabase/client";

export const fetchFromDatabase = async (artist: string, title: string) => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('artist', artist)
    .eq('title', title)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Supabase error:', error);
    throw error;
  }

  // Increment hits for the song
  if (data) {
    await supabase.rpc('increment_song_hits', { song_id: data.id });
  }

  return data;
};

export const saveToDatabase = async (artist: string, title: string, lyrics: string, interpretation: string | null) => {
  const { error } = await supabase
    .from('songs')
    .upsert({
      artist,
      title,
      lyrics,
      interpretation
    });

  if (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
};

export const fetchLyrics = async ({ title, artist }: { title: string; artist: string }) => {
  // First, try to get from database
  const dbSong = await fetchFromDatabase(artist, title);
  if (dbSong) {
    return dbSong;
  }

  // If not in database, fetch from API
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
  );
  
  if (response.status === 404) {
    throw new Error("No lyrics found for this song. Please check the artist and title, or try a different song.");
  }
  
  if (!response.ok) {
    throw new Error("An error occurred while fetching the lyrics. Please try again later.");
  }

  const data = await response.json();
  return { lyrics: data.lyrics, interpretation: null };
};