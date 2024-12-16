import { supabase } from "@/integrations/supabase/client";

export const getAIInterpretation = async (lyrics: string, songTitle: string, artist: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('get-interpretation', {
      body: { lyrics, songTitle, artist }
    });

    if (error) throw new Error(error.message);
    return data.interpretation;
  } catch (error) {
    console.error('Error getting AI interpretation:', error);
    throw new Error("Failed to get AI interpretation. Please try again later.");
  }
};