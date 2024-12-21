import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { fetchFromDatabase, fetchLyrics, saveToDatabase } from "@/services/songService";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { SearchHeader } from "@/components/SearchHeader";
import { toast } from "sonner";
import { getAIInterpretation } from "@/services/interpretationService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const capitalizeForDisplay = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const generateSlug = (artist: string, title: string) => {
  const normalizedArtist = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${normalizedArtist}--${normalizedTitle}-lyrics-and-meaning`;
};

const parseSlugForDirectAccess = (slug: string): { artist: string; title: string } => {
  // Remove the "-lyrics-and-meaning" suffix
  const withoutSuffix = slug.replace(/-lyrics-and-meaning$/, '');
  
  // Split by double hyphen to separate artist and title
  const parts = withoutSuffix.split('--');
  
  if (parts.length !== 2) {
    throw new Error('Invalid URL format');
  }

  // Convert hyphens back to spaces for both artist and title
  const artist = parts[0].replace(/-/g, ' ').trim();
  const title = parts[1].replace(/-/g, ' ').trim();

  if (!artist || !title) {
    throw new Error('Invalid URL format');
  }

  return { artist, title };
};

export const Song = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { "*": slug } = useParams(); // Get the slug from URL params
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Try to get artist and title from navigation state first
  let artist = '', title = '';
  
  if (location.state?.artist && location.state?.title) {
    // If coming from search, use the navigation state
    artist = location.state.artist;
    title = location.state.title;
  } else if (slug) {
    // If accessing directly via URL, parse the slug
    try {
      const parsed = parseSlugForDirectAccess(slug);
      artist = parsed.artist;
      title = parsed.title;
    } catch (error) {
      console.error('Error parsing slug:', error);
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter an artist and song title");
      return;
    }
    if (!searchInput.includes('-')) {
      toast.error('Please use the format "Artist - Song Title" (e.g. "Tate McRae - The Nights")');
      return;
    }
    setIsSearching(true);
    try {
      const [newArtist, newTitle] = searchInput.split('-').map(s => s.trim());
      const newSlug = generateSlug(newArtist, newTitle);
      navigate(`/songs/${newSlug}`, {
        state: { artist: newArtist.toLowerCase(), title: newTitle.toLowerCase() }
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSearching(false);
    }
  };
  
  const { data: song, isLoading } = useQuery({
    queryKey: ['song', artist, title],
    queryFn: async () => {
      if (!artist || !title) throw new Error('Invalid song URL');
      
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
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-primary">Loading song...</div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Song Not Found - Lyriko</title>
          <meta property="og:title" content="Song Not Found - Lyriko" />
          <meta property="og:description" content="We couldn't find the lyrics you're looking for. Try searching for another song." />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="article" />
        </Helmet>
        <SearchHeader 
          searchInput={searchInput}
          isLoading={isSearching}
          onSearchInputChange={setSearchInput}
          onSearch={handleSearch}
        />
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-4">Song Not Found</h1>
          <p className="text-gray-600">
            We couldn't find lyrics for "{capitalizeForDisplay(title)}" by {capitalizeForDisplay(artist)}. Please check the artist and song title, or try searching for a different song.
          </p>
        </div>
      </div>
    );
  }

  const truncatedInterpretation = song?.interpretation 
    ? song.interpretation.split(' ').slice(0, 30).join(' ') + '...'
    : 'Explore the meaning and interpretation of this song.';

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{`${capitalizeForDisplay(song?.title || title)} by ${capitalizeForDisplay(song?.artist || artist)} - Lyrics and Meaning`}</title>
        <meta 
          property="og:title" 
          content={`${capitalizeForDisplay(song?.title || title)} by ${capitalizeForDisplay(song?.artist || artist)} - Lyrics and Meaning`} 
        />
        <meta 
          property="og:description" 
          content={truncatedInterpretation} 
        />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
      </Helmet>
      
      <SearchHeader 
        searchInput={searchInput}
        isLoading={isSearching}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
      />
      
      <h1 className="text-3xl font-bold mb-4">{capitalizeForDisplay(song?.title || title)}</h1>
      <h2 className="text-xl text-gray-600 mb-8">by {capitalizeForDisplay(song?.artist || artist)}</h2>
      
      {song?.lyrics && (
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
