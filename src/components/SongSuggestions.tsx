import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SongSuggestionsProps {
  onSelect: (artist: string, title: string) => void;
}

interface Suggestion {
  artist: string;
  title: string;
}

export function SongSuggestions({ onSelect }: SongSuggestionsProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

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
      setSuggestions([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`https://api.lyrics.ovh/suggest/${encodeURIComponent(searchValue)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        const data = await response.json();
        
        // Map the API response to our suggestion format
        const formattedSuggestions = data.data.map((item: any) => ({
          artist: item.artist.name,
          title: item.title
        })).slice(0, 5); // Limit to 5 suggestions
        
        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('Search error:', error);
        toast.error("Failed to fetch suggestions");
        setSuggestions([]);
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
            placeholder="Search for songs or artists..."
          />
          <Command.List className="max-h-[300px] overflow-y-auto">
            {isSearching ? (
              <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
            ) : suggestions.length === 0 ? (
              <Command.Empty>No results found.</Command.Empty>
            ) : (
              suggestions.map((suggestion) => (
                <Command.Item
                  key={`${suggestion.artist}-${suggestion.title}`}
                  value={`${suggestion.artist} - ${suggestion.title}`}
                  onSelect={() => {
                    onSelect(suggestion.artist, suggestion.title);
                    setOpen(false);
                    const fullValue = `${suggestion.artist} - ${suggestion.title}`;
                    setInputValue(fullValue);
                    setSearchValue("");
                  }}
                  className="px-4 py-2 hover:bg-accent cursor-pointer"
                >
                  {suggestion.artist} - {suggestion.title}
                </Command.Item>
              ))
            )}
          </Command.List>
        </div>
      )}
    </Command>
  );
}