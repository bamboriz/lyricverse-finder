import { capitalizeForDisplay } from "@/utils/urlUtils";

interface SongHeaderProps {
  title: string;
  artist: string;
}

export const SongHeader = ({ title, artist }: SongHeaderProps) => {
  return (
    <div className="relative z-20 bg-background py-4">
      <h1 className="text-3xl font-bold mb-4">{capitalizeForDisplay(title)}</h1>
      <h2 className="text-xl text-gray-600 mb-8">by {capitalizeForDisplay(artist)}</h2>
    </div>
  );
};