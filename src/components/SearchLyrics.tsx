import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SearchParams {
  title?: string;
  artist?: string;
}

const fetchLyrics = async ({ title, artist }: SearchParams) => {
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist || "")}/${encodeURIComponent(
      title || ""
    )}`
  );
  if (!response.ok) {
    throw new Error("Lyrics not found");
  }
  return response.json();
};

export const SearchLyrics = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    title: "",
    artist: "",
  });
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lyrics", searchParams],
    queryFn: () => fetchLyrics(searchParams),
    enabled: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.title || !searchParams.artist) {
      toast.error("Please enter both artist and title");
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
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Artist name"
            value={searchParams.artist}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, artist: e.target.value }))
            }
            className="flex-1"
          />
          <Input
            placeholder="Song title"
            value={searchParams.title}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, title: e.target.value }))
            }
            className="flex-1"
          />
          <Button type="submit" className="md:w-auto" disabled={isLoading}>
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
            <h2 className="text-2xl font-bold mb-4">
              {searchParams.title} - {searchParams.artist}
            </h2>
            <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {data.lyrics}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};