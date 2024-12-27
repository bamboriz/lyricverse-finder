import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongSuggestions } from "./SongSuggestions";
import { Link } from "react-router-dom";

interface SearchHeaderProps {
  searchInput: string;
  isLoading: boolean;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export const SearchHeader = ({
  searchInput,
  isLoading,
  onSearchInputChange,
  onSearch,
}: SearchHeaderProps) => {
  return (
    <div className="max-w-3xl mx-auto px-4 mb-12 animate-fade-up">
      <div className="text-center mb-8">
        <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Lyriko
          </h1>
        </Link>
        <p className="text-gray-600">
          Search for your favorite song lyrics and get AI interpretation
        </p>
      </div>

      <form onSubmit={onSearch} className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1">
            <SongSuggestions
              onSelect={(artist, title) => {
                onSearchInputChange(`${artist} - ${title}`);
              }}
            />
          </div>
          <Button type="submit" className="whitespace-nowrap" disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
};