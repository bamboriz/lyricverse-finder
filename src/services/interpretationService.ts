import { supabase } from "@/integrations/supabase/client";

export const getAIInterpretation = async (lyrics: string, songTitle: string, artist: string) => {
  try {
    // Get the OpenAI API key from Supabase
    const { data, error: secretError } = await supabase.rpc('get_secret', { 
      secret_name: 'OPENAI_API_KEY' 
    });
    
    if (secretError) throw new Error('Could not retrieve OpenAI API key');
    if (!data?.[0]?.key) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data[0].key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a music expert that provides deep, thoughtful interpretations of song lyrics. Analyze the following lyrics and provide a clear, insightful interpretation that explores the meaning, themes, and symbolism.'
          },
          {
            role: 'user',
            content: `Please interpret these lyrics for the song "${songTitle}" by ${artist}:\n\n${lyrics}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data2 = await response.json();
    return data2.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI interpretation:', error);
    throw new Error("Failed to get AI interpretation. Please try again later.");
  }
};