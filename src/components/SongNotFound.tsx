import { Helmet } from "react-helmet";
import { SearchHeader } from "./SearchHeader";
import { capitalizeForDisplay } from "@/utils/urlUtils";
import { useState } from "react";
import { Button } from "./ui/button";
import { LyricsSubmissionForm } from "./LyricsSubmissionForm";
import { useNavigate } from "react-router-dom";
import { generateSlug } from "@/utils/urlUtils";

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
  const navigate = useNavigate();
  const [showLyricsForm, setShowLyricsForm] = useState(false);

  const handleSuccess = () => {
    const slug = generateSlug(artist, title);
    navigate(`/songs/${slug}`, {
      state: { artist, title }
    });
  };

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
        <p className="text-gray-600 mb-8">
          We couldn't find lyrics for "{capitalizeForDisplay(title)}" by {capitalizeForDisplay(artist)}. Please check the artist and song title, or try searching for a different song.
        </p>

        {!showLyricsForm ? (
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-4">
              Do you have the lyrics? You can submit them and we'll generate an interpretation for you.
            </p>
            <Button 
              onClick={() => setShowLyricsForm(true)}
              variant="outline"
              className="w-full"
            >
              Submit Lyrics
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Submit Lyrics</h2>
            <p className="text-sm text-gray-500 mb-4">
              Paste the lyrics below and we'll format them properly and generate an interpretation.
            </p>
            <LyricsSubmissionForm 
              artist={artist}
              title={title}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
};