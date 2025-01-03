import { useQuery } from "@tanstack/react-query";
import { fetchFromDatabase, fetchLyrics, saveToDatabase } from "@/services/songService";
import { getAIInterpretation } from "@/services/interpretationService";
import { toast } from "sonner";

export const useSongData = (artist: string, title: string) => {
  return useQuery({
    queryKey: ['song', artist, title],
    queryFn: async () => {
      if (!artist || !title) return null;
      
      try {
        // First try to get from database
        const dbSong = await fetchFromDatabase(artist, title);
        
        // If we have both lyrics and interpretation, return it
        if (dbSong?.lyrics && dbSong?.interpretation) {
          return dbSong;
        }

        // If we have lyrics but no interpretation, get interpretation
        if (dbSong?.lyrics && !dbSong?.interpretation) {
          const interpretation = await getAIInterpretation(dbSong.lyrics, title, artist);
          await saveToDatabase(artist, title, dbSong.lyrics, interpretation);
          return {
            ...dbSong,
            interpretation
          };
        }

        // If nothing in database, fetch lyrics from API
        const apiResult = await fetchLyrics({ artist, title });
        
        if (!apiResult.lyrics) {
          throw new Error(`No lyrics found for "${title}" by ${artist}`);
        }

        // Get interpretation for the lyrics
        const interpretation = await getAIInterpretation(apiResult.lyrics, title, artist);
        
        // Save everything to database
        await saveToDatabase(artist, title, apiResult.lyrics, interpretation);
        
        return {
          artist,
          title,
          lyrics: apiResult.lyrics,
          interpretation
        };
      } catch (error) {
        console.error('Error fetching song:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load song');
        throw error;
      }
    },
    enabled: !!artist && !!title,
    retry: false, // Don't retry failed queries
  });
};