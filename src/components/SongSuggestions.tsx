import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchLyrics } from "@/services/songService";
import { toast } from "sonner";

interface SongSuggestionsProps {
  onSelect: (artist: string, title: string) => void;
}

export function SongSuggestions({ onSelect }: SongSuggestionsProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ artist: string; title: string }>>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Try to parse artist and title from search input
        const parts = searchValue.split('-');
        if (parts.length === 2) {
          const artist = parts[0].trim();
          const title = parts[1].trim();
          await fetchLyrics({ artist, title });
          setSearchResults([{ artist, title }]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchValue]);

  return (
    <Command className="relative">
      <div>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => setOpen((open) => !open)}
        >
          {inputValue || "Search songs..."}
        </Button>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg border overflow-hidden z-50">
          <Command.Input
            value={searchValue}
            onValueChange={setSearchValue}
            className="w-full px-4 py-2 border-b"
            placeholder='Enter "Artist - Song Title"'
          />
          <Command.List className="max-h-[300px] overflow-y-auto">
            {isSearching ? (
              <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
            ) : searchResults.length === 0 ? (
              <Command.Empty>No results found. Try "Artist - Song Title" format.</Command.Empty>
            ) : (
              searchResults.map((result) => (
                <Command.Item
                  key={`${result.artist}-${result.title}`}
                  value={`${result.artist} - ${result.title}`}
                  onSelect={() => {
                    onSelect(result.artist, result.title);
                    setOpen(false);
                    const fullValue = `${result.artist} - ${result.title}`;
                    setInputValue(fullValue);
                    setSearchValue("");
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  {result.artist} - {result.title}
                </Command.Item>
              ))
            )}
          </Command.List>
        </div>
      )}
    </Command>
  );
}