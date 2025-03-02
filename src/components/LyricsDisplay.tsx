
import { Card } from "@/components/ui/card";
import { LyricCards } from "./LyricCards";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Edit2, Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSlug } from "@/utils/urlUtils";
import { capitalizeForDisplay } from "@/utils/urlUtils";

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
  interpretationFirst?: boolean;
}

export const LyricsDisplay = ({ 
  lyrics, 
  interpretation, 
  isLoadingInterpretation,
  songTitle,
  artist,
  interpretationFirst = false
}: LyricsDisplayProps) => {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState(lyrics);
  const [isSaving, setIsSaving] = useState(false);

  const displayTitle = songTitle ? capitalizeForDisplay(songTitle) : '';
  const displayArtist = artist ? capitalizeForDisplay(artist) : '';

  const handleSave = async () => {
    if (!artist || !songTitle) {
      toast.error("Missing artist or song title");
      return;
    }

    setIsSaving(true);
    try {
      const formattedLyrics = formatLyrics(editedLyrics);
      
      const { error } = await supabase
        .from("songs")
        .update({ lyrics: formattedLyrics })
        .eq('artist', artist)
        .eq('title', songTitle);

      if (error) throw error;

      toast.success("Lyrics updated successfully!");
      setIsEditing(false);
      const slug = generateSlug(artist, songTitle);
      window.location.replace(`/songs/${slug}`);
    } catch (error) {
      console.error('Error saving lyrics:', error);
      toast.error("Failed to save lyrics. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const LyricsContent = () => (
    <Card className="p-8 bg-white shadow-lg rounded-xl border-0">
      <div className="flex justify-between items-center mb-8">
        <div className="w-full text-center flex items-center justify-between">
          <div className="w-8"></div> {/* Empty space to balance the edit button */}
          <h2 className="text-3xl font-bold text-primary">
            {displayTitle ? `${displayTitle} Lyrics` : 'Lyrics'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isSaving}
          >
            {isEditing ? (
              <Save className="h-5 w-5" />
            ) : (
              <Edit2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      {isEditing ? (
        <Textarea
          value={editedLyrics}
          onChange={(e) => setEditedLyrics(e.target.value)}
          className="min-h-[400px] font-serif text-xl leading-relaxed"
          placeholder="Edit lyrics here..."
        />
      ) : (
        <div className="font-serif text-xl leading-relaxed whitespace-pre-wrap text-center">
          {formatLyrics(lyrics)}
          <div className="mt-8 text-sm text-gray-500 italic">
            Lyrics licensed by MusixMatch
          </div>
        </div>
      )}
    </Card>
  );

  const InterpretationContent = () => (
    <Card className="p-8 bg-white shadow-lg rounded-xl border-0">
      <h2 className="text-3xl font-bold mb-8 text-primary">
        {displayTitle ? `${displayTitle} Meaning` : 'Interpretation'}
      </h2>
      <div className="prose prose-lg max-w-none">
        {isLoadingInterpretation ? (
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-primary">Analyzing lyrics...</div>
          </div>
        ) : interpretation ? (
          <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-line">
            <h3 className="text-xl font-semibold mb-4">
              What {displayTitle} Means
            </h3>
            {interpretation}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Click "Get AI Interpretation" to analyze these lyrics
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 w-full container px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isMobile ? (
          <>
            <InterpretationContent />
            <div className="mt-8 mb-16">
              <LyricCards lyrics={lyrics} songTitle={songTitle} artist={artist} />
            </div>
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-accent">
              <Collapsible>
                <CollapsibleTrigger className="w-full p-4">
                  <div className="flex items-center justify-between p-4 bg-white shadow-lg rounded-xl">
                    <span className="text-lg font-semibold text-primary">View Lyrics</span>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <LyricsContent />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </>
        ) : (
          <>
            <div className={`${interpretationFirst ? 'order-2' : 'order-1'}`}>
              <LyricsContent />
            </div>
            <div className={`${interpretationFirst ? 'order-1' : 'order-2'}`}>
              <InterpretationContent />
            </div>
          </>
        )}
      </div>

      {!isMobile && (
        <div className="mt-64">
          <LyricCards lyrics={lyrics} songTitle={songTitle} artist={artist} />
        </div>
      )}
    </div>
  );
};
