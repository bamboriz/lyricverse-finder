import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const suggestions = [
  { artist: "Taylor Swift", title: "Cruel Summer" },
  { artist: "Drake", title: "Rich Flex" },
  { artist: "The Weeknd", title: "Blinding Lights" },
  { artist: "Bad Bunny", title: "Tití Me Preguntó" },
  { artist: "Harry Styles", title: "As It Was" },
];

interface SongSuggestionsProps {
  onSelect: (artist: string, title: string) => void;
}

export function SongSuggestions({ onSelect }: SongSuggestionsProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

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
            value={inputValue}
            onValueChange={setInputValue}
            className="w-full px-4 py-2 border-b"
            placeholder="Search songs..."
          />
          <Command.List className="max-h-[300px] overflow-y-auto">
            <Command.Empty>No results found.</Command.Empty>
            {suggestions.map((suggestion) => (
              <Command.Item
                key={`${suggestion.artist}-${suggestion.title}`}
                value={`${suggestion.artist} - ${suggestion.title}`}
                onSelect={() => {
                  onSelect(suggestion.artist, suggestion.title);
                  setOpen(false);
                  setInputValue(`${suggestion.artist} - ${suggestion.title}`);
                }}
                className="px-4 py-2 hover:bg-accent cursor-pointer"
              >
                {suggestion.artist} - {suggestion.title}
              </Command.Item>
            ))}
          </Command.List>
        </div>
      )}
    </Command>
  );
}