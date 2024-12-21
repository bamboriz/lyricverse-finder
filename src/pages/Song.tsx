import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { fetchFromDatabase, fetchLyrics, saveToDatabase } from "@/services/songService";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { toast } from "sonner";

export const Song = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Extract artist and title from the slug
  // Format: artist-title-lyrics-and-meaning
  const [artist, title] = slug?.split('-lyrics-and-meaning')[0].split('-') || [];
  
  const { data: song, isLoading, error } = useQuery({
    queryKey: ['song', artist, title],
    queryFn: async () => {
      if (!artist || !title) throw new Error('Invalid song URL');
      
      try {
        // First try to get from database
        const dbSong = await fetchFromDatabase(artist, title);
        if (dbSong) {
          return dbSong;
        }

        // If not in database, fetch from API
        const apiResult = await fetchLyrics({ artist, title });
        
        // Save to database for future requests
        if (apiResult.lyrics) {
          await saveToDatabase(artist, title, apiResult.lyrics, apiResult.interpretation);
          return {
            artist,
            title,
            ...apiResult
          };
        }
        
        throw new Error(`No lyrics found for "${title}" by ${artist}`);
      } catch (error) {
        console.error('Error fetching song:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load song');
        throw error;
      }
    },
    enabled: !!artist && !!title,
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-primary">Loading song...</div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-4">Song Not Found</h1>
          <p className="text-gray-600">
            We couldn't find lyrics for "{title}" by {artist}. Please check the artist and song title, or try searching for a different song.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{`${song.title} by ${song.artist} - Lyrics and Meaning`}</title>
        <meta name="description" content={`Read the lyrics and meaning of ${song.title} by ${song.artist}. Understand the song's interpretation and significance.`} />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-4">{song.title}</h1>
      <h2 className="text-xl text-gray-600 mb-8">by {song.artist}</h2>
      
      {song.lyrics && (
        <LyricsDisplay 
          lyrics={song.lyrics} 
          interpretation={song.interpretation} 
          isLoadingInterpretation={false}
          songTitle={song.title}
          artist={song.artist}
        />
      )}
    </div>
  );
};