import OpenAI from "openai";
import { saveToDatabase } from "./songService";

export const getAIInterpretation = async (lyrics: string, apiKey: string, songTitle: string, artist: string) => {
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are a music expert who provides concise interpretations of song lyrics. Focus on the main themes, symbolism, and meaning. No Markdown please"
      }, {
        role: "user",
        content: `Please interpret the lyrics of "${songTitle}" by ${artist}:\n\n${lyrics}`
      }],
      temperature: 0.7,
      max_tokens: 500
    });

    const interpretation = response.choices[0].message.content;
    
    // Save the interpretation to the database
    await saveToDatabase(artist, songTitle, lyrics, interpretation);
    
    return interpretation;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error("Failed to get AI interpretation. Please check your API key and try again.");
  }
};