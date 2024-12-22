import { supabase } from "@/integrations/supabase/client";
import { generateSitemap } from "../utils/sitemapGenerator";

async function testSitemap() {
  try {
    // First, add a test song
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        artist: 'Test Artist',
        title: 'Test Song',
        lyrics: 'Test lyrics for sitemap generation',
        interpretation: 'Test interpretation'
      })
      .select()
      .single();

    if (songError) throw songError;
    console.log('Test song added:', song);

    // Generate new sitemap
    await generateSitemap();
    console.log('Sitemap regenerated successfully');

    // Fetch and display the new sitemap content
    const { data: sitemap, error: sitemapError } = await supabase
      .from('sitemaps')
      .select('content')
      .single();

    if (sitemapError) throw sitemapError;
    console.log('New sitemap content:', sitemap.content);

  } catch (error) {
    console.error('Error in test:', error);
  }
}

testSitemap()
  .then(() => console.log('Test completed'))
  .catch(console.error);