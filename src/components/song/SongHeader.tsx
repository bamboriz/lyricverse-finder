import { capitalizeForDisplay } from "@/utils/urlUtils";
import { Link } from "react-router-dom";

interface SongHeaderProps {
  title: string;
  artist: string;
}

export const SongHeader = ({ title, artist }: SongHeaderProps) => {
  return (
    <>
      <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
        <h1 className="text-3xl font-bold mb-4">{capitalizeForDisplay(title)}</h1>
      </Link>
      <h2 className="text-xl text-gray-600 mb-8">by {capitalizeForDisplay(artist)}</h2>
    </>
  );
};