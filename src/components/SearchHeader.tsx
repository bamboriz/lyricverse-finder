import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Lyric Search & Interpretation
        </h1>
        <p className="text-gray-600">
          Search for your favorite song lyrics and get AI interpretation
        </p>
      </div>

      <form onSubmit={onSearch} className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Enter artist and/or title (e.g. The Beatles - Yesterday or just Yesterday)"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="whitespace-nowrap" disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
};