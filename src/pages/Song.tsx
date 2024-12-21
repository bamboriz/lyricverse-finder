import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLyrics } from "@/services/songService";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { Helmet } from "react-helmet";

const Song = () => {
  const { slug } = useParams();
  
  // Extract artist and title from the slug
  const [artist, title] = (slug || "").split("-lyrics-and-meaning")[0].split("-").reduce((acc: string[], word, index, array) => {
    if (index === array.length - 1) {
      acc[1] = (acc[1] ? acc[1] + " " : "") + word;
    } else if (index === array.length - 2) {
      acc[1] = word;
    } else {
      acc[0] = (acc[0] ? acc[0] + " " : "") + word;
    }
    return acc;
  }, ["", ""]);

  const { data, isLoading } = useQuery({
    queryKey: ["lyrics", artist, title],
    queryFn: async () => {
      return await fetchLyrics({ artist, title });
    },
    enabled: !!artist && !!title,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent via-white to-accent/50 py-12">
        <div className="text-center py-8">
          <div className="animate-pulse text-primary">Loading song...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent via-white to-accent/50 py-12">
        <div className="text-center py-8 text-red-500">
          Song not found
        </div>
      </div>
    );
  }

  const capitalizedArtist = artist.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const capitalizedTitle = title.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent via-white to-accent/50 py-12">
      <Helmet>
        <title>{`${capitalizedTitle} by ${capitalizedArtist} - Lyrics and Meaning | Lyriko`}</title>
        <meta name="description" content={`Discover the meaning behind ${capitalizedTitle} by ${capitalizedArtist}. Read lyrics and AI-powered interpretation of this song.`} />
        <meta property="og:title" content={`${capitalizedTitle} by ${capitalizedArtist} - Lyrics and Meaning`} />
        <meta property="og:description" content={`Discover the meaning behind ${capitalizedTitle} by ${capitalizedArtist}. Read lyrics and AI-powered interpretation of this song.`} />
      </Helmet>
      
      <LyricsDisplay 
        lyrics={data.lyrics}
        interpretation={data.interpretation}
        isLoadingInterpretation={false}
        songTitle={capitalizedTitle}
        artist={capitalizedArtist}
      />
    </div>
  );
};

export default Song;