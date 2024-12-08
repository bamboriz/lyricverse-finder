import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import OpenAI from "openai";
import { SearchHeader } from "./SearchHeader";
import { LyricsDisplay } from "./LyricsDisplay";

const fetchLyrics = async ({ title, artist }: { title: string; artist: string }) => {
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
  );
  
  if (response.status === 404) {
    throw new Error("No lyrics found for this song. Please check the artist and title, or try a different song.");
  }
  
  if (!response.ok) {
    throw new Error("An error occurred while fetching the lyrics. Please try again later.");
  }

  const data = await response.json();
  return data;
};

const getAIInterpretation = async (lyrics: string, apiKey: string) => {
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a music expert who provides concise interpretations of song lyrics. Focus on the main themes, symbolism, and meaning."
      }, {
        role: "user",
        content: `Please interpret these lyrics concisely:\n\n${lyrics}`
      }],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error("Failed to get AI interpretation. Please check your API key and try again.");
  }
};

const formatLyrics = (lyrics: string) => {
  return lyrics
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");
};

export const SearchLyrics = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("openai_api_key") || "");
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lyrics", searchInput],
    queryFn: () => {
      let artist = "", title = "";
      if (searchInput.includes("-")) {
        [artist, title] = searchInput.split("-").map((s) => s.trim());
      } else {
        artist = searchInput.trim();
        title = searchInput.trim();
      }
      return fetchLyrics({ artist, title });
    },
    enabled: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter an artist or song title");
      return;
    }
    setIsSearching(true);
    setInterpretation(null);
    await refetch();
    
    // Automatically get interpretation if API key exists
    if (apiKey && data?.lyrics) {
      handleGetInterpretation();
    }
  };

  const handleGetInterpretation = async () => {
    if (!apiKey) {
      toast.error("Please enter your OpenAI API key first");
      return;
    }
    if (!data?.lyrics) {
      toast.error("Please search for lyrics first");
      return;
    }
    
    try {
      setIsLoadingInterpretation(true);
      localStorage.setItem("openai_api_key", apiKey);
      const result = await getAIInterpretation(data.lyrics, apiKey);
      setInterpretation(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get interpretation");
    } finally {
      setIsLoadingInterpretation(false);
    }
  };

  return (
    <>
      <SearchHeader 
        searchInput={searchInput}
        apiKey={apiKey}
        isLoading={isLoading}
        onSearchInputChange={setSearchInput}
        onApiKeyChange={setApiKey}
        onSearch={handleSearch}
        onGetInterpretation={handleGetInterpretation}
        hasLyrics={!!data?.lyrics}
      />

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-pulse text-primary">Searching for lyrics...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500">
          {error instanceof Error ? error.message : "An error occurred while fetching the lyrics."}
        </div>
      )}

      {data && isSearching && (
        <div className="animate-fade-up">
          <LyricsDisplay 
            lyrics={formatLyrics(data.lyrics)} 
            interpretation={interpretation}
            isLoadingInterpretation={isLoadingInterpretation}
          />
        </div>
      )}
    </>
  );
};