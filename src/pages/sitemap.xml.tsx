import { supabase } from "@/integrations/supabase/client";

export async function getServerSideProps({ res }: { res: any }) {
  try {
    // Fetch the latest sitemap from the database
    const { data, error } = await supabase
      .from('sitemaps')
      .select('content')
      .single();

    if (error) throw error;

    // Set the content type to XML
    res.setHeader('Content-Type', 'text/xml');
    // Return the XML content
    res.write(data.content);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    res.status(500).end();
    return {
      props: {},
    };
  }
}

// This is a special page that only handles getServerSideProps
export default function Sitemap() {
  return null;
}