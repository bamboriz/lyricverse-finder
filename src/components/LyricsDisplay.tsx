import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LyricsDisplayProps {
  lyrics: string;
  interpretation: string | null;
}

export const LyricsDisplay = ({ lyrics, interpretation }: LyricsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4">
      <Card className="p-6 bg-white/50 backdrop-blur-sm border-accent">
        <h2 className="text-2xl font-bold mb-4 text-primary">Lyrics</h2>
        <ScrollArea className="h-[600px] w-full pr-4">
          <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
            {lyrics}
          </div>
        </ScrollArea>
      </Card>

      <Card className="p-6 bg-white/50 backdrop-blur-sm border-accent">
        <h2 className="text-2xl font-bold mb-4 text-primary">Interpretation</h2>
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
  );
};