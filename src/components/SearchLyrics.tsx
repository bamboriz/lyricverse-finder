import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { SearchHeader } from "./SearchHeader";
import { LyricsDisplay } from "./LyricsDisplay";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLyrics } from "@/services/songService";
import { getAIInterpretation } from "@/services/interpretationService";

const formatLyrics = (lyrics: string) => {
  return lyrics
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");
};

export const SearchLyrics = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [currentSong, setCurrentSong] = useState({ title: "", artist: "" });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lyrics", searchInput],
    queryFn: async () => {
      let artist = "", title = "";
      if (searchInput.includes("-")) {
        [artist, title] = searchInput.split("-").map((s) => s.trim());
      } else {
        artist = searchInput.trim();
        title = searchInput.trim();
      }
      setCurrentSong({ title, artist });
      const result = await fetchLyrics({ artist, title });
      
      if (result.interpretation) {
        setInterpretation(result.interpretation);
      }
      
      return result;
    },
    enabled: false,
  });

  const handleGetInterpretation = async () => {
    if (!data?.lyrics) {
      toast.error("Please search for lyrics first");
      return;
    }
    
    try {
      setIsLoadingInterpretation(true);
      const result = await getAIInterpretation(data.lyrics, currentSong.title, currentSong.artist);
      setInterpretation(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get interpretation");
    } finally {
      setIsLoadingInterpretation(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter an artist or song title");
      return;
    }
    setIsSearching(true);
    setInterpretation(null);
    try {
      await refetch();
    } catch (error) {
      // Error is already handled by the query
    }
  };

  return (
    <>
      <SearchHeader 
        searchInput={searchInput}
        isLoading={isLoading}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
        onGetInterpretation={handleGetInterpretation}
        hasLyrics={!!data?.lyrics}
      />

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-pulse text-primary">Searching for lyrics...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500">
          {error instanceof Error ? error.message : "An error occurred while fetching the lyrics."}
        </div>
      )}

      {data && isSearching && (
        <div className="animate-fade-up">
          <LyricsDisplay 
            lyrics={formatLyrics(data.lyrics)} 
            interpretation={interpretation}
            isLoadingInterpretation={isLoadingInterpretation}
            songTitle={currentSong.title}
            artist={currentSong.artist}
          />
        </div>
      )}
    </>
  );
};