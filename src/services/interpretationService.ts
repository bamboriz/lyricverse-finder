import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const getAIInterpretation = async (lyrics: string, title: string, artist: string) => {
  try {
    // Get the OpenAI API key from Supabase secrets
    const { data: secretData, error: secretError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'OPENAI_API_KEY')
      .maybeSingle();

    if (secretError) {
      console.error('Error fetching OpenAI API key:', secretError);
      throw new Error('Failed to get AI interpretation. Please try again later.');
    }

    if (!secretData?.value) {
      console.error('No OpenAI API key found');
      throw new Error('OpenAI API key not configured');
    }

    console.log('Lyrics length for interpretation:', lyrics.length); // Debug log

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretData.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using the more capable model
        messages: [
          {
            role: 'system',
            content: 'You are a music expert who specializes in breaking down song lyrics with engaging, clear, and concise explanations. Provide simple interpretations of each verse, focusing on the main themes, symbolism, and emotional meaning. Use straightforward language that anyone can understand while capturing the essence of the song. Keep it brief, insightful, and impactful. No Markdown'
          },
          {
            role: 'user',
            content: `Please interpret the lyrics of "${title}" by ${artist}:\n\n${lyrics}`
          }
        ],
        max_tokens: 2000, // Increased token limit for interpretation
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI interpretation. Please try again later.');
    }

    const data = await response.json();
    const interpretation = data.choices[0].message.content;
    console.log('Interpretation length:', interpretation.length); // Debug log
    return interpretation;
  } catch (error) {
    console.error('Error in getAIInterpretation:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Failed to get AI interpretation');
    }
    throw error;
  }
};