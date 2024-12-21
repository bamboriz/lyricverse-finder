import { Helmet } from "react-helmet";
import { SearchHeader } from "./SearchHeader";
import { capitalizeForDisplay } from "@/utils/urlUtils";

interface SongNotFoundProps {
  artist: string;
  title: string;
  searchInput: string;
  isSearching: boolean;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export const SongNotFound = ({ 
  artist, 
  title, 
  searchInput, 
  isSearching, 
  onSearchInputChange, 
  onSearch 
}: SongNotFoundProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Song Not Found - Lyriko</title>
        <meta property="og:title" content="Song Not Found - Lyriko" />
        <meta property="og:description" content="We couldn't find the lyrics you're looking for. Try searching for another song." />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
      </Helmet>
      <SearchHeader 
        searchInput={searchInput}
        isLoading={isSearching}
        onSearchInputChange={onSearchInputChange}
        onSearch={onSearch}
      />
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Song Not Found</h1>
        <p className="text-gray-600">
          We couldn't find lyrics for "{capitalizeForDisplay(title)}" by {capitalizeForDisplay(artist)}. Please check the artist and song title, or try searching for a different song.
        </p>
      </div>
    </div>
  );
};