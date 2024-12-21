import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchFromDatabase, fetchLyrics, saveToDatabase } from "@/services/songService";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { SearchHeader } from "@/components/SearchHeader";
import { SongMetadata } from "@/components/SongMetadata";
import { SongNotFound } from "@/components/SongNotFound";
import { toast } from "sonner";
import { getAIInterpretation } from "@/services/interpretationService";
import { useState, useEffect } from "react";
import { generateSlug, parseSlugForDirectAccess, capitalizeForDisplay } from "@/utils/urlUtils";

export const Song = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { "*": slug } = useParams();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  
  useEffect(() => {
    try {
      if (location.state?.artist && location.state?.title) {
        // If coming from search, use the navigation state
        setArtist(location.state.artist);
        setTitle(location.state.title);
      } else if (slug) {
        // If accessing directly via URL, parse the slug
        try {
          const parsed = parseSlugForDirectAccess(slug);
          setArtist(parsed.artist);
          setTitle(parsed.title);
        } catch (error) {
          console.error('Error parsing slug:', error);
          toast.error("Invalid song URL");
          navigate('/');
          return;
        }
      } else {
        // Only redirect if we have neither state nor slug
        toast.error("No song information provided");
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error getting song info:', error);
      toast.error("Invalid song URL");
      navigate('/');
      return;
    }
  }, [location.state, slug, navigate]);

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
      <SongNotFound 
        artist={artist}
        title={title}
        searchInput={searchInput}
        isSearching={isSearching}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SongMetadata 
        title={song?.title || title}
        artist={song?.artist || artist}
        interpretation={song?.interpretation}
      />
      
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