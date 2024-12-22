import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SUPABASE_URL = "https://pceknypetgjazdviwrup.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWtueXBldGdqYXpkdml3cnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwODQ4OTcsImV4cCI6MjA0OTY2MDg5N30.dN_zaIz-pGqF1eH6FQzWoJXr8yw2ETW473DpkybEC_o";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BASE_URL = 'https://lyriko.xyz';

// Helper function to generate slug (copied from urlUtils.ts)
const generateSlug = (artist, title) => {
  const normalizedArtist = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${normalizedArtist}--${normalizedTitle}-lyrics-and-meaning`;
};

async function generateLocalSitemap() {
  try {
    const { data: songs, error } = await supabase
      .from('songs')
      .select('artist, title, created_at');

    if (error) {
      console.error('Error fetching songs:', error);
      return;
    }

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

    // Get the directory of the current module
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicDir = path.join(__dirname, '../../public');
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