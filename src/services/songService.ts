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