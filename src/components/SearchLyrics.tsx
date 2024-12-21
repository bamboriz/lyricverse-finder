import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { SearchHeader } from "./SearchHeader";
import { LyricsDisplay } from "./LyricsDisplay";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLyrics } from "@/services/songService";
import { getAIInterpretation } from "@/services/interpretationService";
import { useNavigate } from "react-router-dom";

const formatLyrics = (lyrics: string) => {
  return lyrics
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");
};

const normalizeText = (text: string) => {
  return text.toLowerCase().trim();
};

const generateSlug = (artist: string, title: string) => {
  const normalizedArtist = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${normalizedArtist}-${normalizedTitle}-lyrics-and-meaning`;
};

export const SearchLyrics = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lyrics", searchInput],
    queryFn: async () => {
      let artist = "", title = "";
      if (searchInput.includes("-")) {
        [artist, title] = searchInput.split("-").map((s) => normalizeText(s));
      } else {
        // If no hyphen, assume the entire input is both artist and title
        // This might need to be adjusted based on your requirements
        artist = normalizeText(searchInput);
        title = normalizeText(searchInput);
      }
      
      const result = await fetchLyrics({ artist, title });
      
      if (result.lyrics) {
        const slug = generateSlug(artist, title);
        navigate(`/songs/${slug}`);
      }
      
      return result;
    },
    enabled: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter an artist or song title");
      return;
    }
    setIsSearching(true);
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
    </>
  );
};