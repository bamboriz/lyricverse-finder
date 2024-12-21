import { Card } from "@/components/ui/card";
import { LyricCards } from "./LyricCards";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const formatLyrics = (text: string) => {
  // Split the lyrics into verses (double newlines indicate verse breaks)
  const verses = text.split(/\n\s*\n/);
  
  // Process each verse
  const formattedVerses = verses.map(verse => {
    // Split verse into lines and only trim the start and end of the verse block
    // This preserves spacing between lines within the verse
    return verse.trim();
  });
  
  // Join verses back together with double newlines to maintain verse separation
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
    <Card className="p-6 bg-white/50 backdrop-blur-sm border-accent">
      <h2 className="text-2xl font-bold mb-4 text-primary">Lyrics</h2>
      <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap">
        {formatLyrics(lyrics)}
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 w-full container px-1 sm:px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isMobile ? (
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-accent rounded-lg">
                <span className="text-lg font-semibold text-primary">View Lyrics</span>
                <ChevronDown className="h-5 w-5" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <LyricsContent />
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <LyricsContent />
        )}

        <Card className="p-6 bg-white/50 backdrop-blur-sm border-accent">
          <h2 className="text-2xl font-bold mb-4 text-primary">Interpretation</h2>
          <div className="prose prose-lg">
            {isLoadingInterpretation ? (
              <div className="flex items-center justify-center">
                <div className="animate-pulse text-primary">Analyzing lyrics...</div>
              </div>
            ) : interpretation ? (
              <div className="whitespace-pre-wrap">
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

      {/* Added more vertical spacing here with mt-12 */}
      <div className="mt-12">
        <LyricCards lyrics={lyrics} songTitle={songTitle} artist={artist} />
      </div>
    </div>
  );
};