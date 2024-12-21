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
  // First try with spaced hyphen " - ", if not found try with regular hyphen "-"
  const spacedHyphenIndex = input.indexOf(' - ');
  const regularHyphenIndex = input.indexOf('-');
  
  const separatorIndex = spacedHyphenIndex !== -1 ? spacedHyphenIndex : regularHyphenIndex;
  const separatorLength = spacedHyphenIndex !== -1 ? 3 : 1; // " - " is 3 chars, "-" is 1 char
  
  if (separatorIndex === -1) {
    throw new Error('Please enter both artist and song title separated by "-" or " - " (e.g. "Céline Dion - Pour que tu m\'aimes encore")');
  }
  
  // Extract and preserve case and special characters for API calls
  const artist = input.slice(0, separatorIndex).trim();
  const title = input.slice(separatorIndex + separatorLength).trim();
  
  if (!artist || !title) {
    throw new Error('Please enter both artist and song title separated by "-" or " - " (e.g. "Céline Dion - Pour que tu m\'aimes encore")');
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
