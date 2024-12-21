import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lyrics, songTitle, artist } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a music expert who specializes in breaking down song lyrics with engaging, clear, and concise explanations. Provide simple interpretations of each verse, focusing on the main themes, symbolism, and emotional meaning. Use straightforward language that anyone can understand while capturing the essence of the song. Keep it brief, insightful, and engaging with NO MARKDOWN!'
          },
          {
            role: 'user',
            content: `Please interpret the lyrics of "${songTitle}" by ${artist}:\n\n${lyrics}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const data = await response.json();
    console.log('Received response from OpenAI');
    
    if (!data.choices || !data.choices[0]) {
      console.error('Unexpected OpenAI response:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const interpretation = data.choices[0].message.content;

    // Save to database using Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabaseClient
      .from('songs')
      .upsert({
        artist,
        title: songTitle,
        lyrics,
        interpretation
      });

    if (dbError) {
      console.error('Error saving to database:', dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify({ interpretation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-interpretation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});