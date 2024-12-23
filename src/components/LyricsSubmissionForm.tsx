import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/utils/urlUtils";
import { getAIInterpretation } from "@/services/interpretationService";

interface LyricsSubmissionFormProps {
  artist: string;
  title: string;
}

export const LyricsSubmissionForm = ({ artist: initialArtist, title: initialTitle }: LyricsSubmissionFormProps) => {
  const [lyrics, setLyrics] = useState("");
  const [artist, setArtist] = useState(initialArtist);
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const formatLyrics = async (text: string) => {
    try {
      // Get the OpenAI API key from Supabase secrets
      const { data: secretData, error: secretError } = await supabase
        .from('secrets')
        .select('value')
        .eq('name', 'OPENAI_API_KEY')
        .maybeSingle();

      if (secretError || !secretData?.value) {
        throw new Error('Failed to get API key');
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
              content: 'You are a lyrics formatting assistant. Format the given lyrics with proper line breaks and verse spacing. Keep the original words exactly as they are, just fix the formatting. Return only the formatted lyrics, no explanations.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 5000,
          temperature: 0.3,
        })
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
      toast.error("Please paste some lyrics first");
      return;
    }

    if (!artist.trim() || !title.trim()) {
      toast.error("Please provide both artist and title");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Processing lyrics...");

    try {
      // Format the lyrics first
      const formattedLyrics = await formatLyrics(lyrics);
      
      // Get the interpretation
      const interpretation = await getAIInterpretation(formattedLyrics, title, artist);
      
      // Save to database
      const { error: saveError } = await supabase
        .from("songs")
        .upsert({
          artist: artist.trim(),
          title: title.trim(),
          lyrics: formattedLyrics,
          interpretation
        });

      if (saveError) throw saveError;

      // Dismiss the loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Lyrics added successfully!");

      // Generate the new URL with potentially corrected artist and title
      const slug = generateSlug(artist.trim(), title.trim());
      
      // Navigate to the new URL
      window.location.replace(`/songs/${slug}`);
    } catch (error) {
      console.error('Error submitting lyrics:', error);
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : "Failed to process lyrics. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="artist">Artist</Label>
          <Input
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist name"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="lyrics">Lyrics</Label>
        <Textarea
          id="lyrics"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Paste the song lyrics here..."
          className="min-h-[200px] font-mono"
          disabled={isSubmitting}
        />
      </div>
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