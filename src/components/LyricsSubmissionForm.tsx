import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getAIInterpretation } from "@/services/interpretationService";
import { saveToDatabase } from "@/services/songService";

interface LyricsSubmissionFormProps {
  artist: string;
  title: string;
}

export const LyricsSubmissionForm = ({ artist, title }: LyricsSubmissionFormProps) => {
  const [lyrics, setLyrics] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const formatLyrics = async (rawLyrics: string) => {
    try {
      const { data: secretData } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'OPENAI_API_KEY')
        .single();

      if (!secretData?.value) {
        throw new Error('OpenAI API key not found');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretData.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a lyrics formatting assistant. Format the given lyrics with proper line breaks and verses. Remove any unnecessary text, annotations, or advertisements. Return only the formatted lyrics.'
            },
            { role: 'user', content: rawLyrics }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to format lyrics');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error formatting lyrics:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lyrics.trim()) {
      toast.error("Please enter the lyrics");
      return;
    }

    setIsSubmitting(true);
    try {
      // Format the lyrics
      const formattedLyrics = await formatLyrics(lyrics);
      
      // Get interpretation
      const interpretation = await getAIInterpretation(formattedLyrics, title, artist);
      
      // Save to database
      await saveToDatabase(artist, title, formattedLyrics, interpretation);
      
      toast.success("Lyrics added successfully!");
      
      // Navigate to the song page
      navigate(`/songs/${artist.toLowerCase()}--${title.toLowerCase()}-lyrics-and-meaning`);
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
        placeholder="Paste the song lyrics here..."
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        className="min-h-[200px]"
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Lyrics"}
      </Button>
    </form>
  );
};