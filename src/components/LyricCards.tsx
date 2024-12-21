import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ActionButtons } from "./lyric-card/ActionButtons";
import { LyricPreview } from "./lyric-card/LyricPreview";
import { generateLyricImage } from "../utils/lyricImageGenerator";

interface LyricCardsProps {
  lyrics: string;
  songTitle?: string;
  artist?: string;
}

const colorSuggestions = [
  { name: "Purple Gradient", from: "#8B5CF6", to: "#D6BCFA" },
  { name: "Ocean Blue", from: "#0EA5E9", to: "#38BDF8" },
  { name: "Sunset Orange", from: "#F97316", to: "#FDBA74" },
  { name: "Forest Green", from: "#22C55E", to: "#86EFAC" },
  { name: "Rose Pink", from: "#F43F5E", to: "#FDA4AF" },
];

export const LyricCards = ({ lyrics, songTitle = "Unknown Song", artist = "Unknown Artist" }: LyricCardsProps) => {
  const [customLyric, setCustomLyric] = useState("");
  const [gradientFrom, setGradientFrom] = useState("#8B5CF6");
  const [gradientTo, setGradientTo] = useState("#D6BCFA");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleColorSelect = (from: string, to: string) => {
    setGradientFrom(from);
    setGradientTo(to);
  };

  const handleShare = async () => {
    try {
      const imageUrl = generateLyricImage(canvasRef, customLyric, gradientFrom, gradientTo, songTitle, artist);
      if (!imageUrl) {
        toast.error("Failed to generate image");
        return;
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      await navigator.share({
        title: "Shared Lyric",
        text: customLyric,
        files: [new File([blob], "lyric.png", { type: "image/png" })],
      });
      toast.success("Lyric shared successfully!");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share lyric");
      }
    }
  };

  const handleDownload = () => {
    const imageUrl = generateLyricImage(canvasRef, customLyric, gradientFrom, gradientTo, songTitle, artist);
    if (!imageUrl) {
      toast.error("Failed to generate image");
      return;
    }

    const link = document.createElement("a");
    link.download = "lyric.png";
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Lyric image downloaded!");
  };

  return (
    <div className="w-full px-2">
      <h2 className="text-2xl font-bold mb-4 text-primary">Create Lyric Card</h2>
      <Card className="p-4 bg-white/50 backdrop-blur-sm border-accent w-full">
        <h3 className="font-semibold mb-2">Customize your lyric</h3>
        <div className="space-y-4 w-full">
          <LyricPreview
            customLyric={customLyric}
            setCustomLyric={setCustomLyric}
            gradientFrom={gradientFrom}
            gradientTo={gradientTo}
          />
          
          <ActionButtons
            onShare={handleShare}
            onDownload={handleDownload}
            onColorSelect={handleColorSelect}
            colorSuggestions={colorSuggestions}
          />
        </div>
      </Card>
      <canvas
        ref={canvasRef}
        className="hidden"
        width="800"
        height="800"
      />
    </div>
  );
};