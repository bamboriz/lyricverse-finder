import { Card } from "@/components/ui/card";
import { LyricCards } from "./LyricCards";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const formatLyrics = (text: string) => {
  const verses = text.split(/\n\s*\n/);
  const formattedVerses = verses.map(verse => verse.trim());
  return formattedVerses.filter(verse => verse.length > 0).join('\n\n');
};

interface LyricsDisplayProps {
  lyrics: string;
  interpretation: string | null;
  isLoadingInterpretation: boolean;
  songTitle?: string;
  artist?: string;
}

export const LyricsDisplay = ({ 
  lyrics, 
  interpretation, 
  isLoadingInterpretation,
  songTitle,
  artist
}: LyricsDisplayProps) => {
  const isMobile = useIsMobile();

  const LyricsContent = () => (
    <Card className="p-8 bg-white shadow-lg rounded-xl border-0">
      <h2 className="text-3xl font-bold mb-8 text-primary">Lyrics</h2>
      <div className="font-serif text-xl leading-relaxed whitespace-pre-wrap text-center">
        {formatLyrics(lyrics)}
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 w-full container px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isMobile ? (
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-white shadow-lg rounded-xl">
                <span className="text-lg font-semibold text-primary">View Lyrics</span>
                <ChevronDown className="h-5 w-5" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <LyricsContent />
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <LyricsContent />
        )}

        <Card className="p-8 bg-white shadow-lg rounded-xl border-0">
          <h2 className="text-3xl font-bold mb-8 text-primary">Interpretation</h2>
          <div className="prose prose-lg max-w-none">
            {isLoadingInterpretation ? (
              <div className="flex items-center justify-center">
                <div className="animate-pulse text-primary">Analyzing lyrics...</div>
              </div>
            ) : interpretation ? (
              <div className="text-lg leading-relaxed text-gray-800">
                {interpretation}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Click "Get AI Interpretation" to analyze these lyrics
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-16">
        <LyricCards lyrics={lyrics} songTitle={songTitle} artist={artist} />
      </div>
    </div>
  );
};