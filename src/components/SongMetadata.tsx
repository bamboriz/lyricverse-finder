
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
  
  // Create more engaging meta titles and descriptions
  const metaTitle = `${displayTitle} by ${displayArtist} - Lyrics Meaning & Analysis | Lyriko`;
  
  // Create a more engaging meta description
  const metaDescription = interpretation 
    ? `Decode the true meaning of "${displayTitle}" by ${displayArtist}. Uncover hidden messages, songwriter's intentions, and story behind the lyrics. Get the full analysis now!`
    : `What does "${displayTitle}" by ${displayArtist} really mean? Dive into the lyrics, discover the song's hidden message, and understand the artist's true intentions. Full analysis inside!`;

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta 
        property="og:title" 
        content={`${displayTitle} Lyrics Meaning - What "${displayArtist}" Really Meant | Lyriko`} 
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
