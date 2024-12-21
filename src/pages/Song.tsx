import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { fetchFromDatabase, fetchLyrics, saveToDatabase } from "@/services/songService";
import { LyricsDisplay } from "@/components/LyricsDisplay";

export const Song = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Extract artist and title from the slug
  // Format: artist-title-lyrics-and-meaning
  const [artist, title] = slug?.split('-lyrics-and-meaning')[0].split('-') || [];
  
  const { data: song, isLoading, error } = useQuery({
    queryKey: ['song', artist, title],
    queryFn: async () => {
      if (!artist || !title) throw new Error('Invalid song URL');
      
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
      }
      
      return {
        artist,
        title,
        ...apiResult
      };
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

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error instanceof Error ? error.message : "Failed to load song"}
      </div>
    );
  }

  if (!song) {
    return (
      <div className="text-center py-8 text-red-500">
        Song not found
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