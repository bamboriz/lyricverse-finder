import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/utils/urlUtils";
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://lyriko.xyz';

async function generateLocalSitemap() {
  try {
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

    // Write to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);

    console.log('Sitemap generated successfully at public/sitemap.xml');
    console.log(`Total songs in sitemap: ${songs.length}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Run the script
generateLocalSitemap()
  .then(() => console.log('Script completed'))
  .catch(console.error);