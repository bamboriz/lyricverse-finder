import { Helmet } from "react-helmet";
import { capitalizeForDisplay } from "@/utils/urlUtils";

interface SongMetadataProps {
  title: string;
  artist: string;
  interpretation?: string | null;
}

export const SongMetadata = ({ title, artist, interpretation }: SongMetadataProps) => {
  const truncatedInterpretation = interpretation 
    ? interpretation.split(' ').slice(0, 30).join(' ') + '...'
    : 'Explore the meaning and interpretation of this song.';

  return (
    <Helmet>
      <title>{`${capitalizeForDisplay(title)} by ${capitalizeForDisplay(artist)} - Lyrics and Meaning`}</title>
      <meta 
        property="og:title" 
        content={`${capitalizeForDisplay(title)} by ${capitalizeForDisplay(artist)} - Lyrics and Meaning`} 
      />
      <meta 
        property="og:description" 
        content={truncatedInterpretation} 
      />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:type" content="article" />
    </Helmet>
  );
};