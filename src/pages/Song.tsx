
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { SearchHeader } from "@/components/SearchHeader";
import { SongMetadata } from "@/components/SongMetadata";
import { SongNotFound } from "@/components/SongNotFound";
import { toast } from "sonner";
import { generateSlug, parseSlugForDirectAccess } from "@/utils/urlUtils";
import { useSongData } from "@/hooks/useSongData";
import { LoadingState } from "@/components/song/LoadingState";
import { SongHeader } from "@/components/song/SongHeader";
import { Button } from "@/components/ui/button";

export const Song = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  
  useEffect(() => {
    if (location.state?.artist && location.state?.title) {
      setArtist(location.state.artist);
      setTitle(location.state.title);
    } else if (slug) {
      try {
        const parsed = parseSlugForDirectAccess(slug);
        setArtist(parsed.artist);
        setTitle(parsed.title);
      } catch (error) {
        console.error('Error parsing slug:', error);
        toast.error("Invalid song URL");
        navigate('/');
      }
    } else {
      toast.error("No song information provided");
      navigate('/');
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
  
  const { data: song, isLoading } = useSongData(artist, title);

  const handleTikTokFollow = () => {
    window.open('https://www.tiktok.com/@lyrikoxyz', '_blank');
  };

  if (isLoading) {
    return <LoadingState />;
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
      
      <div className="flex flex-col items-center mb-8">
        <SongHeader title={song?.title || title} artist={song?.artist || artist} />
        <Button
          onClick={handleTikTokFollow}
          className="bg-black hover:bg-gray-800 text-white"
        >
          Follow us on TikTok
        </Button>
      </div>
      
      {song?.lyrics && (
        <LyricsDisplay 
          lyrics={song.lyrics} 
          interpretation={song.interpretation} 
          isLoadingInterpretation={false}
          songTitle={song.title}
          artist={song.artist}
          interpretationFirst={true}
        />
      )}
    </div>
  );
};
