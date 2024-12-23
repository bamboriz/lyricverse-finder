import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAIInterpretation } from "@/services/interpretationService";

interface LyricsSubmissionFormProps {
  artist: string;
  title: string;
  onSuccess: () => void;
}

export const LyricsSubmissionForm = ({ artist, title, onSuccess }: LyricsSubmissionFormProps) => {
  const [lyrics, setLyrics] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatLyrics = async (rawLyrics: string) => {
    const { data, error } = await supabase.functions.invoke('format-lyrics', {
      body: { lyrics: rawLyrics }
    });

    if (error) throw error;
    return data.formattedLyrics;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lyrics.trim()) {
      toast.error("Please enter the lyrics");
      return;
    }

    setIsSubmitting(true);
    try {
      // Format the lyrics first
      const formattedLyrics = await formatLyrics(lyrics);
      
      // Get interpretation
      const interpretation = await getAIInterpretation(formattedLyrics, title, artist);
      
      // Save to database
      const { error } = await supabase
        .from("songs")
        .insert([
          {
            artist,
            title,
            lyrics: formattedLyrics,
            interpretation
          }
        ]);

      if (error) throw error;

      toast.success("Lyrics added successfully!");
      onSuccess();
    } catch (error) {
      console.error('Error submitting lyrics:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit lyrics");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder="Paste the song lyrics here..."
        className="min-h-[200px]"
      />
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Processing..." : "Submit Lyrics"}
      </Button>
    </form>
  );
};