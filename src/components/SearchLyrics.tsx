import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OpenAI from "openai";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchParams {
  title: string;
  artist: string;
}

const fetchLyrics = async ({ title, artist }: SearchParams) => {
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
  // Split by double newlines to separate verses
  const verses = lyrics.split("\n\n");
  
  // Process each verse
  const formattedVerses = verses.map(verse => {
    // Split verse into lines, trim each line, and filter out empty lines
    const lines = verse
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Join the lines back together
    return lines.join("\n");
  }).filter(verse => verse.length > 0); // Filter out empty verses
  
  // Join verses with double newlines
  return formattedVerses.join("\n\n");
};

export const SearchLyrics = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("openai_api_key") || "");
  const [interpretation, setInterpretation] = useState<string | null>(null);

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
      localStorage.setItem("openai_api_key", apiKey);
      const result = await getAIInterpretation(data.lyrics, apiKey);
      setInterpretation(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get interpretation");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12 animate-fade-up">
        <h1 className="text-4xl font-bold mb-4 text-primary">Lyric Search & Interpretation</h1>
        <p className="text-gray-600">Search for your favorite song lyrics and get AI interpretation</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Enter artist and/or title (e.g. The Beatles - Yesterday or just Yesterday)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="whitespace-nowrap" disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="flex gap-4 items-center">
          <Input
            type="password"
            placeholder="Enter your OpenAI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleGetInterpretation}
            disabled={!data?.lyrics}
            variant="secondary"
          >
            Get AI Interpretation
          </Button>
        </div>
      </form>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Lyrics</h2>
              <ScrollArea className="h-[600px] w-full pr-4">
                <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
                  {formatLyrics(data.lyrics)}
                </div>
              </ScrollArea>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Interpretation</h2>
              <ScrollArea className="h-[600px] w-full pr-4">
                <div className="prose prose-lg">
                  {interpretation ? (
                    <div className="whitespace-pre-wrap">{interpretation}</div>
                  ) : (
                    <div className="text-gray-500 italic">
                      Click "Get AI Interpretation" to analyze these lyrics
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};