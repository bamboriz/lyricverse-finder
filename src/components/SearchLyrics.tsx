import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SearchParams {
  title: string;
  artist: string;
}

const fetchLyrics = async ({ title, artist }: SearchParams) => {
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
  );
  if (!response.ok) {
    throw new Error("Lyrics not found");
  }
  return response.json();
};

export const SearchLyrics = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lyrics", searchInput],
    queryFn: () => {
      const [artist, title] = searchInput.split("-").map((s) => s.trim());
      return fetchLyrics({ artist, title });
    },
    enabled: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.includes("-")) {
      toast.error("Please enter search in format: Artist - Title");
      return;
    }
    setIsSearching(true);
    await refetch();
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-12 animate-fade-up">
        <h1 className="text-4xl font-bold mb-4 text-primary">Lyric Search</h1>
        <p className="text-gray-600">Search for your favorite song lyrics</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <div className="flex gap-4">
          <Input
            placeholder="Enter search (e.g. The Beatles - Yesterday)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="whitespace-nowrap" disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-pulse text-primary">Searching for lyrics...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500">
          Sorry, we couldn't find lyrics for this song.
        </div>
      )}

      {data && isSearching && (
        <div className="animate-fade-up">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">{searchInput}</h2>
            <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {data.lyrics}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};