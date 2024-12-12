import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Share2, Palette } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [selectedLyric, setSelectedLyric] = useState("");
  const [customLyric, setCustomLyric] = useState("");
  const [gradientFrom, setGradientFrom] = useState("#8B5CF6");
  const [gradientTo, setGradientTo] = useState("#D6BCFA");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleLyricSelect = (line: string) => {
    setSelectedLyric(line);
    setCustomLyric(line);
  };

  const handleColorSelect = (from: string, to: string) => {
    setGradientFrom(from);
    setGradientTo(to);
  };

  const generateLyricImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = 1080;
    canvas.height = 1080;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, gradientFrom);
    gradient.addColorStop(1, gradientTo);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const fontSize = Math.min(84, 1000 / (customLyric.length / 2));
    ctx.font = `bold ${fontSize}px Merriweather`;

    const words = customLyric.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < canvas.width - 160) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    const lineHeight = fontSize * 1.2;
    const startY = canvas.height * 0.4;

    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });

    ctx.font = "400 32px Inter";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    
    const metadata = `${songTitle} - ${artist}`;
    ctx.fillText(metadata, canvas.width - 40, canvas.height - 40);

    return canvas.toDataURL("image/png");
  };

  const handleShare = async () => {
    try {
      const imageUrl = generateLyricImage();
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

  useEffect(() => {
    generateLyricImage();
  }, [customLyric, gradientFrom, gradientTo]);

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
              <div 
                ref={previewRef}
                className="relative aspect-square rounded-lg overflow-hidden shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                }}
              >
                <textarea
                  value={customLyric}
                  onChange={(e) => setCustomLyric(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent text-white text-center resize-none p-4 focus:outline-none font-serif text-2xl"
                  style={{
                    background: 'transparent',
                    border: 'none',
                  }}
                  placeholder="Enter or edit your lyric"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Palette className="w-4 h-4 mr-2" />
                      Change Colors
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      {colorSuggestions.map((color, index) => (
                        <div
                          key={index}
                          onClick={() => handleColorSelect(color.from, color.to)}
                          className="p-2 cursor-pointer hover:bg-accent rounded flex items-center gap-2"
                        >
                          <div
                            className="w-8 h-8 rounded"
                            style={{
                              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                            }}
                          />
                          <span>{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
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
        width="1080"
        height="1080"
      />
    </div>
  );
};