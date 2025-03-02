
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
  
  // Create concise but effective meta title
  const metaTitle = `${displayTitle} by ${displayArtist} - Lyrics Meaning | Lyriko`;
  
  // Create a concise but compelling meta description
  const metaDescription = interpretation 
    ? `Discover what "${displayTitle}" by ${displayArtist} really means. Get lyrics, analysis, and the story behind this song.`
    : `What does "${displayTitle}" by ${displayArtist} mean? Explore lyrics and discover the true message behind this song.`;

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta property="og:title" content={`${displayTitle} Lyrics Meaning - ${displayArtist} | Lyriko`} />
      <meta property="og:description" content={metaDescription} />
      <meta name="description" content={metaDescription} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:type" content="article" />
    </Helmet>
  );
};
