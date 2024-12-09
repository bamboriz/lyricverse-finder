import { Card } from "@/components/ui/card";

interface LyricsDisplayProps {
  lyrics: string;
  interpretation: string | null;
  isLoadingInterpretation: boolean;
}

export const LyricsDisplay = ({ lyrics, interpretation, isLoadingInterpretation }: LyricsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4">
      <Card className="p-6 bg-white/50 backdrop-blur-sm border-accent">
        <h2 className="text-2xl font-bold mb-4 text-primary">Lyrics</h2>
        <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
          {lyrics}
        </div>
      </Card>

      <Card className="p-6 bg-white/50 backdrop-blur-sm border-accent">
        <h2 className="text-2xl font-bold mb-4 text-primary">Interpretation</h2>
        <div className="prose prose-lg">
          {isLoadingInterpretation ? (
            <div className="flex items-center justify-center">
              <div className="animate-pulse text-primary">Analyzing lyrics...</div>
            </div>
          ) : interpretation ? (
            <div className="whitespace-pre-wrap">{interpretation}</div>
          ) : (
            <div className="text-gray-500 italic">
              Click "Get AI Interpretation" to analyze these lyrics
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};