import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "./urlUtils";

const BASE_URL = 'https://lyriko.xyz';

export const generateSitemap = async () => {
  // Fetch all songs from the database
  const { data: songs, error } = await supabase
    .from('songs')
    .select('artist, title, created_at');

  if (error) {
    console.error('Error fetching songs:', error);
    return;
  }

  // Generate the XML content
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/songs/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${songs.map(song => `
  <url>
    <loc>${BASE_URL}/songs/${generateSlug(song.artist, song.title)}</loc>
    <lastmod>${new Date(song.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  // Store the sitemap in the database
  const { error: upsertError } = await supabase
    .from('sitemaps')
    .upsert({ 
      id: 1, // We'll always use ID 1 since we only need one sitemap
      content: xml,
      updated_at: new Date().toISOString()
    });

  if (upsertError) {
    console.error('Error saving sitemap:', upsertError);
    return;
  }

  console.log('Sitemap generated successfully');
};