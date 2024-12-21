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
            content: 'You are a music expert who provides insightful interpretations of song lyrics. Your analysis should be thorough but concise, focusing on the main themes, symbolism, and meaning behind the words.'
          },
          {
            role: 'user',
            content: `Please interpret the lyrics of "${title}" by ${artist}:\n\n${lyrics}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI interpretation. Please try again later.');
    }

    const data = await response.json();
    return data.choices[0].message.content;
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