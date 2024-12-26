import { capitalizeForDisplay } from "@/utils/urlUtils";

interface SongHeaderProps {
  title: string;
  artist: string;
}

export const SongHeader = ({ title, artist }: SongHeaderProps) => {
  return (
    <div className="mt-16 mb-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{capitalizeForDisplay(title)}</h1>
        <h2 className="text-xl text-gray-600">by {capitalizeForDisplay(artist)}</h2>
      </div>
    </div>
  );
};