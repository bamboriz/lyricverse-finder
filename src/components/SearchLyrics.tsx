import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { SearchHeader } from "./SearchHeader";
import { LyricsDisplay } from "./LyricsDisplay";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLyrics } from "@/services/songService";
import { useNavigate } from "react-router-dom";

const formatLyrics = (text: string) => {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");
};

const generateSlug = (artist: string, title: string) => {
  const normalizedArtist = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${normalizedArtist}-${normalizedTitle}-lyrics-and-meaning`;
};

const parseSearchInput = (input: string): { artist: string; title: string } => {
  const firstHyphenIndex = input.indexOf('-');
  if (firstHyphenIndex === -1) {
    throw new Error('Please enter both artist and song title separated by a hyphen (e.g. "Tate McRae - The Nights")');
  }
  
  // Extract and preserve original spacing, just trim the ends
  const artist = input.slice(0, firstHyphenIndex).trim();
  const title = input.slice(firstHyphenIndex + 1).trim();
  
  if (!artist || !title) {
    throw new Error('Please enter both artist and song title separated by a hyphen (e.g. "Tate McRae - The Nights")');
  }
  
  return { artist, title };
};

export const SearchLyrics = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lyrics", searchInput],
    queryFn: async () => {
      try {
        const { artist, title } = parseSearchInput(searchInput);
        const slug = generateSlug(artist, title);
        navigate(`/songs/${slug}`);
        return { artist, title };
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
        throw error;
      }
    },
    enabled: false,
  });

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