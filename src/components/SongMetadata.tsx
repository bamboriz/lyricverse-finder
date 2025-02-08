
import { Helmet } from "react-helmet";
import { capitalizeForDisplay } from "@/utils/urlUtils";

interface SongMetadataProps {
  title: string;
  artist: string;
  interpretation?: string | null;
}

export const SongMetadata = ({ title, artist, interpretation }: SongMetadataProps) => {
  const displayTitle = capitalizeForDisplay(title);
  const displayArtist = capitalizeForDisplay(artist);
  
  // Create a more detailed meta description
  const metaDescription = interpretation 
    ? `Discover the meaning behind "${displayTitle}" by ${displayArtist}. ${interpretation.split(' ').slice(0, 20).join(' ')}... Get lyrics, interpretation, and deeper insights into this song's message.`
    : `Explore the lyrics and meaning of "${displayTitle}" by ${displayArtist}. Find detailed song interpretation, analysis, and deeper understanding of the song's message.`;

  return (
    <Helmet>
      <title>{`${displayTitle} by ${displayArtist} - Lyrics and Meaning | Lyriko`}</title>
      <meta 
        property="og:title" 
        content={`${displayTitle} by ${displayArtist} - Lyrics Meaning and Interpretation`} 
      />
      <meta 
        property="og:description" 
        content={metaDescription} 
      />
      <meta name="description" content={metaDescription} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:type" content="article" />
    </Helmet>
  );
};
