import { useState } from "react";
import { Helmet } from "react-helmet";
import { SearchHeader } from "./SearchHeader";
import { capitalizeForDisplay } from "@/utils/urlUtils";
import { Button } from "./ui/button";
import { LyricsSubmissionForm } from "./LyricsSubmissionForm";

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
  const [showLyricsForm, setShowLyricsForm] = useState(false);

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${title} by ${artist} lyrics`)}`;

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
      <div className="text-center py-8 space-y-6">
        <h1 className="text-3xl font-bold mb-4">Song Not Found</h1>
        <p className="text-gray-600">
          We couldn't find lyrics for "{capitalizeForDisplay(title)}" by {capitalizeForDisplay(artist)}. Please check the artist and song title, or try searching for a different song.
        </p>
        
        {!showLyricsForm ? (
          <div className="space-y-4">
            <div className="space-y-2 text-gray-600">
              <p>
                You can help by adding these lyrics to our database! Here's how:
              </p>
              <ol className="list-decimal list-inside text-left max-w-xl mx-auto space-y-2">
                <li>
                  <a 
                    href={googleSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Search Google for the correct lyrics
                  </a>
                </li>
                <li>Double-check the artist name and song title for accuracy</li>
                <li>Copy the lyrics from a reliable source</li>
                <li>Paste them below to get an AI-powered interpretation</li>
              </ol>
            </div>
            <Button onClick={() => setShowLyricsForm(true)}>
              Submit Lyrics
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 mb-4">
              Please paste the lyrics below. Feel free to correct the artist name or song title if needed. We'll format the lyrics and provide an interpretation.
            </p>
            <LyricsSubmissionForm artist={artist} title={title} />
          </div>
        )}
      </div>
    </div>
  );
};