import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { SearchHeader } from "./SearchHeader";
import { LyricsDisplay } from "./LyricsDisplay";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLyrics } from "@/services/songService";
import { useNavigate } from "react-router-dom";

const formatLyrics = (text: string) => {
  // Split the lyrics into verses (double newlines indicate verse breaks)
  const verses = text.split(/\n\s*\n/);
  
  // Process each verse
  const formattedVerses = verses.map(verse => {
    // Split verse into lines and only trim the start and end of the verse block
    // This preserves spacing between lines within the verse
    return verse.trim();
  });
  
  // Join verses back together with double newlines to maintain verse separation
  return formattedVerses.filter(verse => verse.length > 0).join('\n\n');
};

// This function is only for URL slugs, not database storage
const generateSlug = (artist: string, title: string) => {
  const normalizedArtist = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${normalizedArtist}-${normalizedTitle}-lyrics-and-meaning`;
};

// Updated to better handle special characters and accents
const parseSearchInput = (input: string): { artist: string; title: string } => {
  // Find the last occurrence of " - " to handle cases where the artist name might contain hyphens
  const lastHyphenIndex = input.lastIndexOf(' - ');
  if (lastHyphenIndex === -1) {
    throw new Error('Please enter both artist and song title separated by " - " (e.g. "Céline Dion - Pour que tu m\'aimes encore")');
  }
  
  // Extract and preserve case and special characters for API calls
  const artist = input.slice(0, lastHyphenIndex).trim();
  const title = input.slice(lastHyphenIndex + 3).trim(); // +3 to skip " - "
  
  if (!artist || !title) {
    throw new Error('Please enter both artist and song title separated by " - " (e.g. "Céline Dion - Pour que tu m\'aimes encore")');
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
