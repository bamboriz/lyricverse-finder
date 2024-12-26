import { Check, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SongSuggestion {
  artist: {
    name: string;
  };
  title: string;
}

interface SongSuggestionsProps {
  onSelect: (artist: string, title: string) => void;
}

export const SongSuggestions = ({ onSelect }: SongSuggestionsProps) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SongSuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async (value: string) => {
    if (!value) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.lyrics.ovh/suggest/${encodeURIComponent(value)}`
      );
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {searchTerm || "Search for a song..."}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Type to search..." 
            value={searchTerm}
            onValueChange={(search) => {
              setSearchTerm(search);
              if (search.length >= 2) {
                fetchSuggestions(search);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Loading suggestions...</div>
              ) : (
                <div className="py-6 text-center text-sm">No songs found.</div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((song, index) => (
                <CommandItem
                  key={`${song.artist.name}-${song.title}-${index}`}
                  onSelect={() => {
                    onSelect(song.artist.name, song.title);
                    setOpen(false);
                    setSearchTerm(`${song.artist.name} - ${song.title}`);
                  }}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  {song.artist.name} - {song.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};