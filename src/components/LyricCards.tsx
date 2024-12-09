import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface LyricCardsProps {
  lyrics: string;
  songTitle?: string;
  artist?: string;
}

export const LyricCards = ({ lyrics, songTitle = "Unknown Song", artist = "Unknown Artist" }: LyricCardsProps) => {
  const [selectedLyric, setSelectedLyric] = useState("");
  const [customLyric, setCustomLyric] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleLyricSelect = (line: string) => {
    setSelectedLyric(line);
    setCustomLyric(line);
  };

  const generateLyricImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas dimensions
    canvas.width = 1200;
    canvas.height = 630;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#8B5CF6");
    gradient.addColorStop(1, "#D6BCFA");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add main lyric text
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Set font and size for main lyric
    const fontSize = Math.min(60, 1000 / (customLyric.length / 2));
    ctx.font = `bold ${fontSize}px Inter`;

    // Word wrap text
    const words = customLyric.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < canvas.width - 100) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    // Draw main lyric lines
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = (canvas.height - totalHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });

    // Add song metadata
    ctx.font = "20px Inter";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    
    // Draw song title and artist
    const metadata = `${songTitle} - ${artist}`;
    ctx.fillText(metadata, canvas.width - 40, canvas.height - 30);

    return canvas.toDataURL("image/png");
  };

  const handleShare = async () => {
    try {
      const imageUrl = generateLyricImage();
      if (!imageUrl) {
        toast.error("Failed to generate image");
        return;
      }

      // Convert base64 to blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Share the image
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
    const imageUrl = generateLyricImage();
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
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-primary">Create Lyric Card</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-accent">
            <h3 className="font-semibold mb-2">Select a line</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lyrics.split("\n").map((line, index) => (
                line.trim() && (
                  <div
                    key={index}
                    onClick={() => handleLyricSelect(line)}
                    className="p-2 hover:bg-accent cursor-pointer rounded transition-colors"
                  >
                    {line}
                  </div>
                )
              ))}
            </div>
          </Card>
          
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-accent">
            <h3 className="font-semibold mb-2">Customize your lyric</h3>
            <div className="space-y-4">
              <Input
                value={customLyric}
                onChange={(e) => setCustomLyric(e.target.value)}
                placeholder="Enter or edit your lyric"
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  className="flex-1"
                  variant="secondary"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex-1"
                  variant="secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="hidden"
        width="1200"
        height="630"
      />
    </div>
  );
};