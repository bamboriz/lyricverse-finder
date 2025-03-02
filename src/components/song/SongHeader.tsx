
import { capitalizeForDisplay } from "@/utils/urlUtils";

interface SongHeaderProps {
  title: string;
  artist: string;
}

export const SongHeader = ({ title, artist }: SongHeaderProps) => {
  const displayTitle = capitalizeForDisplay(title);
  const displayArtist = capitalizeForDisplay(artist);
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">
        {displayTitle} Lyrics and Meaning by {displayArtist}
      </h1>
      <h2 className="text-xl text-gray-600 mb-8">Song Interpretation and Analysis</h2>
    </>
  );
};
